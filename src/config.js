if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGO_URI: process.env.MONGO_URI || "mongodb://localhost:27017/fintech",
  JWT_SECRET: process.env.JWT_SECRET || "supersecretkey",
  STOCK_API_KEY: process.env.STOCK_API_KEY || "supersecretkey",
  STOCK_API_URL:
    process.env.STOCK_API_URL || "https://www.alphavantage.co/query",
  TWELVE_DATA_API_URL:
    process.env.TWELVE_DATA_API_URL || "https://api.twelvedata.com",
  TWELVE_DATA_API_KEY: process.env.TWELVE_DATA_API_KEY || "supersecretkey",
};