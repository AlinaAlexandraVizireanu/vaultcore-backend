const express = require("express");
const stocks = require("../controllers/stocks");
const catchAsync = require("../utilities/catchAsync");
// const { STOCK_API_URL, STOCK_API_KEY } = require("../config");

const router = express.Router();

// Route: Search for a stock
router.get("/search", catchAsync(stocks.searchStock));

module.exports = router;
