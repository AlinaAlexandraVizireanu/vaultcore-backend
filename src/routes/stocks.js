const express = require("express");
const stocks = require("../controllers/stocks");
const catchAsync = require("../utilities/catchAsync");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Route: Search for a stock
router.get("/search", catchAsync(stocks.searchStock));

// Route to buy a stock
router.post("/order", authMiddleware, catchAsync(stocks.orderStock));

// Get all purchased stocks for a user
router.get("/portfolio", authMiddleware, catchAsync(stocks.showStock));

// Get all orders for a user
router.get("/orders", authMiddleware, catchAsync(stocks.showOrders));

// Get data for charts
router.get("/chart", catchAsync(stocks.getChartData));
router.get("/candlestick", catchAsync(stocks.getCandlestickData));

module.exports = router;
