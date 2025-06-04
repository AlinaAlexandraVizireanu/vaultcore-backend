const {
  STOCK_API_URL,
  STOCK_API_KEY,
  TWELVE_DATA_API_URL,
  TWELVE_DATA_API_KEY,
} = require("../config");
const axios = require("axios");

async function getQuoteFromTwelveData(symbol) {
  try {
    const response = await axios.get(`${TWELVE_DATA_API_URL}/quote`, {
      params: {
        symbol,
        apikey: TWELVE_DATA_API_KEY,
      },
    });

    const data = response.data;

    return {
      symbol: data.symbol || "ERR",
      name: data.name || symbol || "API Error",
      currency: data.currency || "API",
      open: data.open || "123",
      high: data.high || "321",
      low: data.low || "1",
      price: data.close || "12",
      previousClose: data.previous_close || "152",
      change: data.change || "2",
      changePercent: data.percent_change
        ? `${parseFloat(data.percent_change).toFixed(2)}%`
        : "0.2",
    };
  } catch (error) {
    console.error(`Twelve Data fallback failed for ${symbol}`);
    return {
      symbol,
      name: symbol,
      price: "N/A",
      change: "N/A",
    };
  }
}
const getAlphaChartData = async (symbol) => {
  const response = await axios.get(STOCK_API_URL, {
    params: {
      function: "TIME_SERIES_DAILY",
      symbol,
      outputsize: "full",
      apikey: STOCK_API_KEY,
    },
  });

  const timeSeries = response.data["Time Series (Daily)"];
  if (!timeSeries) throw new Error("Alpha Vantage data unavailable");

  const startOfYear = new Date(new Date().getFullYear(), 0, 1);

  return Object.entries(timeSeries)
    .filter(([date]) => new Date(date) >= startOfYear)
    .reverse() // chronological order
    .map(([date, values]) => ({
      time: date,
      value: parseFloat(values["4. close"]),
    }));
};

const getTwelveChartData = async (symbol) => {
  const startOfYear = new Date(new Date().getFullYear(), 0, 1)
    .toISOString()
    .split("T")[0]; // YYYY-MM-DD format
  const response = await axios.get(`${TWELVE_DATA_API_URL}/time_series`, {
    params: {
      symbol,
      interval: "1day",
      start_date: startOfYear,
      apikey: TWELVE_DATA_API_KEY,
    },
  });

  const values = response.data?.values || [];
  return values.reverse().map((point) => ({
    time: point.datetime,
    value: parseFloat(point.close),
  }));
};

module.exports = {
  getQuoteFromTwelveData,
  getAlphaChartData,
  getTwelveChartData,
};
