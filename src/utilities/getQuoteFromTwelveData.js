const { TWELVE_DATA_API_URL, TWELVE_DATA_API_KEY } = require("../config");
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
    console.log("Twelve Data Quote Response:", data);

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

module.exports = getQuoteFromTwelveData;
