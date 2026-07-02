const ExpressError = require("../utilities/ExpressError");
const UserStock = require("../models/UserStock");
const Transactions = require("../models/Transactions");
const processOrder = require("../utilities/processOrder");
const {
  getQuoteFromTwelveData,
  getAlphaCandlestickData,
  getTwelveCandlestickData,
  getNewsData,
} = require("../utilities/getData");
const axios = require("axios");
const {
  STOCK_API_URL,
  STOCK_API_KEY,
  TWELVE_DATA_API_URL,
  TWELVE_DATA_API_KEY,
} = require("../config");

module.exports.getChartData = async (req, res) => {
  const { symbol } = req.query;
  if (!symbol) throw new ExpressError("Symbol is required", 400);

  let candles;

  try {
    candles = await getAlphaCandlestickData(symbol);
  } catch (err) {
    console.warn("Alpha failed, trying Twelve:", err.message);
    candles = await getTwelveCandlestickData(symbol);
  }

  const line = candles.map((candle) => ({
    time: candle.time,
    value: candle.close,
  }));

  res.json({
    candles,
    line,
  });
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
      const results = matches.slice(0, 5).map((match) => ({
        symbol: match["1. symbol"],
        name: match["2. name"],
        currency: match["8. currency"],
      }));

      return res.json(results);
    }

    console.warn("Alpha Vantage search failed. Trying Twelve Data...");

    const tdSearchRes = await axios.get(
      `${TWELVE_DATA_API_URL}/symbol_search`,
      {
        params: {
          symbol: query,
          apikey: TWELVE_DATA_API_KEY,
        },
      },
    );

    const tdMatches = tdSearchRes.data?.data || [];

    if (!tdMatches.length) {
      throw new ExpressError("No matches found from either provider", 404);
    }

    const results = tdMatches.slice(0, 5).map((match) => ({
      symbol: match.symbol,
      name: match.instrument_name || match.name || match.symbol,
      currency: match.currency || "N/A",
    }));

    return res.json(results);
  } catch (err) {
    console.error("Search error:", err.message);
    throw new ExpressError("Failed to search stocks", 500);
  }
};

module.exports.getStockQuote = async (req, res) => {
  const { symbol } = req.query;

  if (!symbol) throw new ExpressError("Symbol is required", 400);

  try {
    const quote = await getQuoteFromTwelveData(symbol);
    res.json(quote);
  } catch (err) {
    console.error("Quote error:", err.message);
    throw new ExpressError("Failed to fetch stock quote", 500);
  }
};

module.exports.orderStock = async (req, res) => {
  const { symbol, name, quantity, price, transactionType } = req.body;

  const transaction = await processOrder({
    userId: req.userId,
    symbol,
    name,
    quantity,
    price,
    transactionType,
  });

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

module.exports.showNews = async (req, res) => {
  try {
    const newsData = await getNewsData();
    res.json(newsData);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: "Failed to fetch market news" });
  }
};
