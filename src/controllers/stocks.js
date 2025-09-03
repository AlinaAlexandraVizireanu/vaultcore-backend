const ExpressError = require("../utilities/ExpressError");
const UserStock = require("../models/UserStock");
const Transactions = require("../models/Transactions");
const {
  getQuoteFromTwelveData,
  getAlphaChartData,
  getTwelveChartData,
  getAlphaCandlestickData,
  getTwelveCandlestickData,
} = require("../utilities/getData");
const axios = require("axios");
const {
  STOCK_API_URL,
  STOCK_API_KEY,
  TWELVE_DATA_API_URL,
  TWELVE_DATA_API_KEY,
} = require("../config");

module.exports.getCandlestickData = async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) throw new ExpressError("Symbol is required", 400);

  try {
    const data = await getAlphaCandlestickData(symbol);
    res.json(data);
  } catch (err) {
    console.warn(
      "Alpha Vantage candle failed, trying Twelve Data:",
      err.message
    );
    try {
      const fallbackData = await getTwelveCandlestickData(symbol);
      res.json(fallbackData);
    } catch (err2) {
      console.error("Both candle providers failed:", err2.message);
      throw new ExpressError("Failed to fetch candlestick chart data", 500);
    }
  }
};

module.exports.getChartData = async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) throw new ExpressError("Symbol is required", 400);

  try {
    const data = await getAlphaChartData(symbol);
    res.json(data);
  } catch (err) {
    console.warn("Alpha Vantage failed, trying Twelve Data:", err.message);
    try {
      const fallbackData = await getTwelveChartData(symbol);
      res.json(fallbackData);
    } catch (err2) {
      console.error("Both providers failed:", err2.message);
      throw new ExpressError("Failed to fetch chart data", 500);
    }
  }
};

module.exports.searchStock = async (req, res) => {
  const { query } = req.query;
  if (!query) throw new ExpressError("Query is required", 400);

  try {
    const alphaVintageResponse = await axios.get(`${STOCK_API_URL}`, {
      params: {
        function: "SYMBOL_SEARCH",
        keywords: query,
        apikey: STOCK_API_KEY,
      },
    });

    const matches = alphaVintageResponse?.data?.bestMatches || [];

    if (matches.length) {
      const topMatches = matches.slice(0, 2);

      const enrichedResults = await Promise.all(
        topMatches.map(async (match) => {
          const symbol = match["1. symbol"];
          const name = match["2. name"];
          const currency = match["8. currency"];

          try {
            const quoteRes = await axios.get(`${STOCK_API_URL}`, {
              params: {
                function: "GLOBAL_QUOTE",
                symbol,
                apikey: STOCK_API_KEY,
              },
            });

            if (
              quoteRes.data.Note &&
              quoteRes.data.Note.includes("frequency")
            ) {
              throw new Error("Alpha Vantage rate limit hit");
            }

            const quote = quoteRes?.data?.["Global Quote"];

            return {
              symbol,
              name,
              currency,
              open: quote?.["02. open"] || "N/A",
              high: quote?.["03. high"] || "N/A",
              low: quote?.["04. low"] || "N/A",
              price: quote?.["05. price"] || "N/A",
              previousClose: quote?.["08. previous close"] || "N/A",
              change: quote?.["09. change"] || "N/A",
              changePercent: quote?.["10. change percent"] || "N/A",
            };
          } catch (err) {
            return await getQuoteFromTwelveData(symbol);
          }
        })
      );
      const deduplicatedResults = Array.from(
        new Map(enrichedResults.map((stock) => [stock.symbol, stock])).values()
      );

      return res.json(deduplicatedResults);
    }

    console.warn("Alpha Vantage search failed. Trying Twelve Data...");

    const tdSearchRes = await axios.get(
      `${TWELVE_DATA_API_URL}/symbol_search`,
      {
        params: {
          symbol: query,
          apikey: TWELVE_DATA_API_KEY,
        },
      }
    );

    const tdMatches = tdSearchRes.data?.data || [];

    if (!tdMatches.length) {
      throw new ExpressError("No matches found from either provider", 404);
    }

    const topMatches = tdMatches.slice(0, 2);

    const fallbackResults = await Promise.all(
      topMatches.map((match) => getQuoteFromTwelveData(match.symbol))
    );
    const deduplicatedFallback = Array.from(
      new Map(fallbackResults.map((stock) => [stock.symbol, stock])).values()
    );

    return res.json(deduplicatedFallback);
  } catch (err) {
    console.error("Search error:", err.message);
    throw new ExpressError("Failed to search stocks", 500);
  }
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

module.exports.showOrders = async (req, res) => {
  const userOrders = await Transactions.find({ userId: req.userId });
  res.json(userOrders);
};

module.exports.showStock = async (req, res) => {
  const userStocks = await UserStock.find({ userId: req.userId });
  res.json(userStocks);
};
