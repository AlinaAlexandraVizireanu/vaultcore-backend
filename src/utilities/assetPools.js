const assetPools = {
  etf: [
    { symbol: "SPY", name: "SPDR S&P 500 ETF Trust", type: "etf" },
    { symbol: "VTI", name: "Vanguard Total Stock Market ETF", type: "etf" },
    { symbol: "QQQ", name: "Invesco QQQ Trust", type: "etf" },
    { symbol: "VOO", name: "Vanguard S&P 500 ETF", type: "etf" },
    { symbol: "IVV", name: "iShares Core S&P 500 ETF", type: "etf" },
  ],

  tech: [
    { symbol: "AAPL", name: "Apple", type: "stock" },
    { symbol: "MSFT", name: "Microsoft", type: "stock" },
    { symbol: "NVDA", name: "NVIDIA", type: "stock" },
    { symbol: "GOOGL", name: "Alphabet", type: "stock" },
    { symbol: "PLTR", name: "Palantir Technologies", type: "stock" },
  ],

  healthcare: [
    { symbol: "JNJ", name: "Johnson & Johnson", type: "stock" },
    { symbol: "PFE", name: "Pfizer", type: "stock" },
    { symbol: "UNH", name: "UnitedHealth Group", type: "stock" },
    { symbol: "LLY", name: "Eli Lilly", type: "stock" },
    { symbol: "MRK", name: "Merck & Co.", type: "stock" },
  ],

  finance: [
    { symbol: "JPM", name: "JPMorgan Chase", type: "stock" },
    { symbol: "BAC", name: "Bank of America", type: "stock" },
    { symbol: "GS", name: "Goldman Sachs", type: "stock" },
    { symbol: "MS", name: "Morgan Stanley", type: "stock" },
    { symbol: "C", name: "Citigroup", type: "stock" },
  ],
};

module.exports = assetPools;
