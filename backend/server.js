const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

const fraudRoutes = require("./routes/fraudRoutes");

app.use("/api/fraud", fraudRoutes);

const chatbotRoutes = require("./routes/chatbotRoutes");
app.use("/api/chatbot", chatbotRoutes);

const chatbotRoute = require("./routes/chatbot");
app.use("/api/chatbot", chatbotRoute);