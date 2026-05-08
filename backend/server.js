const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const passport = require("passport");
const session = require("express-session");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const compression = require("compression");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

/* ================= CORS CONFIG ================= */

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
].filter(Boolean);

console.log("🌐 Allowed Origins:", allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn("❌ Blocked by CORS:", origin);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept", "Origin"],
  exposedHeaders: ["Content-Range", "X-Content-Range"],
  maxAge: 86400
}));

/* ================= SECURITY MIDDLEWARE ================= */

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      connectSrc: ["'self'", ...allowedOrigins],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  skipSuccessfulRequests: true,
  message: "Too many login attempts, please try again after 15 minutes.",
});

app.use("/api/", limiter);
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);

/* ================= BODY PARSER - MUST BE BEFORE ROUTES ================= */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Data sanitization
// app.use(mongoSanitize());
// app.use(xss());

// Compression
app.use(compression());

/* ================= SESSION & PASSPORT ================= */

app.use(session({
  secret: process.env.SESSION_SECRET || process.env.JWT_SECRET || "secret-key-change-in-production",
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax"
  },
  name: "sessionId",
  rolling: true
}));

app.use(passport.initialize());
app.use(passport.session());

try {
  require("./config/googleAuth")(passport);
  console.log("✅ Google OAuth configured");
} catch (err) {
  console.log("ℹ️ Google OAuth not configured (optional)");
}

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
    allowedHeaders: ["Authorization", "Content-Type"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
  connectTimeout: 45000,
  maxHttpBufferSize: 1e6
});

io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    socket.user = null;
    return next();
  }

  try {
    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;
    next();
  } catch (err) {
    console.log("Socket auth error:", err.message);
    next(new Error("Authentication error"));
  }
});

io.on("connection", (socket) => {
  const userInfo = socket.user ? `${socket.user.email} (${socket.user.role})` : "Unauthenticated";
  console.log(`🔌 Client connected: ${socket.id} - ${userInfo}`);

  if (socket.user?.id) {
    socket.join(`user:${socket.user.id}`);
    socket.join(`role:${socket.user.role}`);
  }

  socket.join("alerts");

  socket.on("subscribe:alerts", (data) => {
    if (socket.user) {
      socket.join(`alerts:${socket.user.id}`);
      console.log(`📢 User ${socket.user.email} subscribed to alerts`);
    }
  });

  socket.on("keystroke:progress", (data) => {
    if (socket.user?.role === "admin") {
      socket.to("role:admin").emit("keystroke:update", {
        userId: socket.user.id,
        progress: data.progress,
        timestamp: new Date()
      });
    }
  });

  socket.on("travel:alert", (data) => {
    console.log(`🚨 Travel alert from ${socket.user?.email}:`, data);
    io.to("role:admin").emit("security:alert", {
      type: "travel_anomaly",
      userId: socket.user?.id,
      email: socket.user?.email,
      data,
      timestamp: new Date()
    });
  });

  // 🆕 Phishing Shield Alert
  socket.on("phishing:alert", (data) => {
    console.log(`🛡️ Phishing alert:`, data);
    io.to("role:admin").emit("shield:alert", {
      type: "phishing_detected",
      ...data,
      timestamp: new Date()
    });
  });

  socket.on("disconnect", (reason) => {
    console.log(`❌ Client disconnected: ${socket.id} - Reason: ${reason}`);
  });

  socket.on("error", (error) => {
    console.error(`Socket error (${socket.id}):`, error.message);
  });
});

app.set("io", io);

app.use((req, res, next) => {
  req.io = io;
  next();
});

/* ================= DATABASE ================= */

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      maxPoolSize: 10,
      minPoolSize: 2,
      retryWrites: true,
      retryReads: true,
    });

    console.log(`✅ MongoDB Atlas Connected: ${conn.connection.host}`);
    await createIndexes();
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    console.log("🔄 Retrying connection in 5 seconds...");
    setTimeout(connectDB, 5000);
  }
};

async function createIndexes() {
  try {
    const User = require("./models/User");
    const LoginLog = require("./models/LoginLog");
    
    await Promise.all([
      User.collection.createIndex({ email: 1 }, { unique: true, background: true }),
      User.collection.createIndex({ "behavioralProfile.keystrokeSignatures.timestamp": -1 }, { background: true }),
      LoginLog.collection.createIndex({ email: 1, createdAt: -1 }, { background: true }),
      LoginLog.collection.createIndex({ deviceId: 1 }, { background: true }),
      LoginLog.collection.createIndex({ combinedRiskScore: -1 }, { background: true }),
      LoginLog.collection.createIndex({ riskLevel: 1 }, { background: true }),
      LoginLog.collection.createIndex({ "travelAnalysis.impossibleTravel": 1 }, { background: true }),
    ]);
    
    console.log("✅ Database indexes verified");
  } catch (err) {
    console.warn("⚠️ Index creation warning:", err.message);
  }
}

connectDB();

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected. Attempting to reconnect...");
});

mongoose.connection.on("reconnected", () => {
  console.log("MongoDB reconnected");
});

/* ================= ROUTES ================= */

// Import routes
const authRoutes = require("./routes/authRoutes");
const fraudRoutes = require("./routes/fraudRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");
const caseRoutes = require("./routes/caseRoutes");
const phishingShieldRoutes = require("./routes/phishingShieldRoutes");
const honeypotRoutes = require("./routes/honeypotRoutes");
app.use("/api/auth/honeypot", honeypotRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    memory: process.memoryUsage()
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/cases", caseRoutes);
app.use("/api/shield", phishingShieldRoutes);  // 🆕 Phishing Shield

/* ================= STATIC FILES ================= */

const fs = require("fs");
const path = require("path");
const uploadsPath = path.join(__dirname, "uploads");

if (fs.existsSync(uploadsPath)) {
  app.use("/uploads", express.static(uploadsPath));
  console.log("📁 Serving static files from /uploads");
}

/* ================= ROOT ROUTE ================= */

app.get("/", (req, res) => {
  res.json({
    message: "🚀 Asian-X Security API Running",
    version: "3.0.0",
    features: [
      "Behavioral Biometrics",
      "Keystroke DNA (Neural Network)",
      "Impossible Travel Detection",
      "Real-time Risk Assessment",
      "MFA Support",
      "AI Phishing Shield",
      "Social Engineering Detection",
      "Prompt Injection Protection"
    ],
    endpoints: {
      auth: "/api/auth",
      fraud: "/api/fraud",
      chatbot: "/api/chatbot",
      cases: "/api/cases",
      shield: "/api/shield",
      health: "/health"
    },
    timestamp: new Date().toISOString()
  });
});

/* ================= 404 HANDLER ================= */

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  });
});

/* ================= GLOBAL ERROR HANDLER ================= */

app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", {
    message: err.message,
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
    url: req.url,
    method: req.method,
    ip: req.ip
  });

  if (err.isOperational) {
    io.to("role:admin").emit("server:error", {
      message: err.message,
      timestamp: new Date()
    });
  }

  const statusCode = err.statusCode || 500;
  
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === "production" 
      ? "Internal server error" 
      : err.message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack })
  });
});

/* ================= GRACEFUL SHUTDOWN ================= */

const gracefulShutdown = async (signal) => {
  console.log(`\n📢 Received ${signal}. Starting graceful shutdown...`);
  
  io.close(() => {
    console.log("🔌 Socket.IO connections closed");
  });
  
  server.close(async () => {
    console.log("🛑 HTTP server closed");
    
    try {
      await mongoose.connection.close();
      console.log("📦 MongoDB connection closed");
    } catch (err) {
      console.error("Error closing MongoDB:", err);
    }
    
    console.log("👋 Graceful shutdown complete");
    process.exit(0);
  });
  
  setTimeout(() => {
    console.error("⏰ Could not close connections in time, forcefully shutting down");
    process.exit(1);
  }, 10000);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

process.on("uncaughtException", (err) => {
  console.error("💥 UNCAUGHT EXCEPTION:", err);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

process.on("unhandledRejection", (reason, promise) => {
  console.error("⚠️ UNHANDLED REJECTION:", reason);
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════════════╗
║                                                          ║
║   🚀 Asian-X Security Server Running                     ║
║                                                          ║
║   📡 Port: ${PORT}                                          ║
║   🌍 Environment: ${process.env.NODE_ENV || "development"}   ║
║   🔗 URL: http://localhost:${PORT}                          ║
║   📊 Features:                                           ║
║      • Behavioral Biometrics 🧬                          ║
║      • Neural Network DNA 🧠                             ║
║      • AI Phishing Shield 🛡️                             ║
║      • Travel Detection ✈️                               ║
║      • Real-time Monitoring 📊                           ║
║                                                          ║
╚══════════════════════════════════════════════════════════╝
  `);
});

module.exports = { app, server, io };