const express = require("express");
const stocks = require("../controllers/stocks");
const catchAsync = require("../utilities/catchAsync");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Route: Search for a stock
router.get("/search", catchAsync(stocks.searchStock));

// Route to buy a stock
router.post("/buy", authMiddleware, catchAsync(stocks.buyStock));

module.exports = router;
