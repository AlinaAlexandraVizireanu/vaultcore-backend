const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const { PORT, MONGO_URI } = require("./config");
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stocks");
const ExpressError = require("./utilities/ExpressError");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);

// Connect to MongoDB
const dbUrl = MONGO_URI;

mongoose.connect(dbUrl);

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

/// Error handler
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).json({ message });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
