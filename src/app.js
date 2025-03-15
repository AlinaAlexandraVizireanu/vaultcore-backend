const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { PORT, MONGO_URI } = require("./config");
const authRoutes = require("./routes/authRoutes");

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);

// Connect to MongoDB
const dbUrl = MONGO_URI;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
