const ExpressError = require("../utilities/ExpressError");
const UserStock = require("../models/UserStock");
const axios = require("axios");
const { STOCK_API_URL, STOCK_API_KEY } = require("../config");

module.exports.searchStock = async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) throw new ExpressError("Symbol is required", 400);

  const response = await axios.get(`${STOCK_API_URL}`, {
    params: {
      function: "GLOBAL_QUOTE",
      symbol: symbol.toUpperCase(),
      apikey: STOCK_API_KEY,
    },
  });

  const stockData = response?.data?.["Global Quote"];

  if (!stockData || Object.keys(stockData).length === 0) {
    throw new ExpressError("Stock not found", 404);
  }

  res.json({
    symbol: stockData["01. symbol"],
    price: stockData["05. price"],
    change: stockData["10. change percent"],
  });
};

module.exports.buyStock = async (req, res) => {
  const { symbol, name, quantity, purchasePrice } = req.body;

  // Check if all required fields are provided
  if (!symbol || !name || !quantity || !purchasePrice)
    throw new ExpressError("All fields are required", 400);

  // Create new stock entry
  const userStock = new UserStock({
    userId: req.userId,
    symbol,
    name,
    quantity,
    purchasePrice,
  });

  await userStock.save();
  res.status(201).json({ message: "Stock purchased successfully", userStock });
};

module.exports.showStock = async (req, res) => {
  const userStocks = await UserStock.find({ userId: req.userId });
  res.json(userStocks);
};
