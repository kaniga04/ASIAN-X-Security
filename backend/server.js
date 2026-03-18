const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
const server = http.createServer(app);

/* ================= CORS CONFIG ================= */

// Allow frontend URL in production
const allowedOrigins = [
  "http://localhost:3000", // local frontend
  process.env.FRONTEND_URL // deployed frontend (Netlify later)
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));

app.use(express.json());

/* ================= SOCKET.IO ================= */

const io = new Server(server, {
  cors: {
    origin: "*", // you can restrict later
    methods: ["GET", "POST"]
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

/* Make socket available globally */
app.set("io", io);

/* ================= DATABASE ================= */

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("MongoDB Atlas Connected 🚀");
  } catch (err) {
    console.error("MongoDB Connection Error ❌", err.message);
    process.exit(1);
  }
};

connectDB();

/* ================= ROUTES ================= */

const authRoutes = require("./routes/authRoutes");
const fraudRoutes = require("./routes/fraudRoutes");
const chatbotRoutes = require("./routes/chatbotRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/fraud", fraudRoutes);
app.use("/api/chatbot", chatbotRoutes);

/* ================= HEALTH CHECK ================= */

app.get("/", (req, res) => {
  res.send("API Running 🚀");
});

/* ================= SERVER ================= */

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});