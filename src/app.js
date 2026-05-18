const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const { PORT, MONGO_URI } = require("./config");
const authRoutes = require("./routes/authRoutes");
const stockRoutes = require("./routes/stocks");
const roboRoutes = require("./routes/robo");
const ExpressError = require("./utilities/ExpressError");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/stocks", stockRoutes);
app.use("/api/robo", roboRoutes);

// Connect to MongoDB
const dbUrl = MONGO_URI;

mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Database connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("DB connection failed:", err);
    process.exit(1);
  });

const db = mongoose.connection;

process.on("SIGINT", () => {
  db.close(() => {
    console.log("MongoDB connection closed.");
    process.exit(0);
  });
});

/// Error handler
app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { statusCode = 500, message = "Something went wrong!" } = err;
  res.status(statusCode).json({
    status: "error",
    statusCode,
    message,
    ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
  });
});
