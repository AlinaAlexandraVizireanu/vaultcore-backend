const ExpressError = require("../utilities/ExpressError");
const UserStock = require("../models/UserStock");
const Transactions = require("../models/Transactions");
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

module.exports.orderStock = async (req, res) => {
  const { symbol, name, quantity, price, transactionType } = req.body;

  if (!symbol || !name || !quantity || !price || !transactionType)
    throw new ExpressError("All fields are required", 400);

  if (!["buy", "sell"].includes(transactionType)) {
    throw new ExpressError("Invalid transaction type", 400);
  }

  const existingStock = await UserStock.findOne({
    userId: req.userId,
    symbol,
  });

  if (transactionType === "sell") {
    if (!existingStock || existingStock.quantity < quantity) {
      throw new ExpressError("Not enough shares to sell", 400);
    }

    existingStock.quantity -= quantity;

    if (existingStock.quantity === 0) {
      await UserStock.deleteOne({ _id: existingStock._id });
    } else {
      await existingStock.save();
    }
  }

  if (transactionType === "buy") {
    if (existingStock) {
      const totalCost =
        existingStock.quantity * existingStock.averagePrice + quantity * price;
      const newQuantity = existingStock.quantity + quantity;
      const newAvgPrice = totalCost / newQuantity;

      existingStock.quantity = newQuantity;
      existingStock.averagePrice = newAvgPrice;
      await existingStock.save();
    } else {
      const newStock = new UserStock({
        userId: req.userId,
        symbol,
        name,
        quantity,
        averagePrice: price,
      });

      await newStock.save();
    }
  }

  const transaction = new Transactions({
    userId: req.userId,
    symbol,
    quantity,
    price,
    totalValue: quantity * price,
    transactionType,
  });

  await transaction.save();

  res.status(201).json({
    message: "Order processed successfully",
    transaction,
  });
};

module.exports.showStock = async (req, res) => {
  const userStocks = await UserStock.find({ userId: req.userId });
  res.json(userStocks);
};
