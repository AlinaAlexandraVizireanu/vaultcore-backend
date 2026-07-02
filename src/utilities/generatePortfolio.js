const assetPools = require("./assetPools");
const getPrice = require("./getPrice");

function getAllocation(riskLevel) {
  switch (riskLevel) {
    case "low":
      return { etf: 0.6, stocks: 0.4 };
    case "medium":
      return { etf: 0.4, stocks: 0.6 };
    case "high":
      return { etf: 0.2, stocks: 0.8 };
    default:
      return { etf: 0.4, stocks: 0.6 };
  }
}

function getRandomElements(arr, num) {
  const shuffled = [...arr];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, num);
}

const generatePortfolio = async (profile) => {
  const allocation = getAllocation(profile.riskLevel);

  const etfBudget = profile.budget * allocation.etf;
  const stocksBudget = profile.budget * allocation.stocks;

  // from the assetPools, get 2 random etf assets
  const etfAssets = getRandomElements(assetPools.etf, 2);

  const interests = Array.isArray(profile.interests) ? profile.interests : [];

  // from the assetPools, get 2 random stock assets for each interest
  const stockAssets = interests.flatMap((interest) =>
    getRandomElements(assetPools[interest], 2),
  );

  // Calculate the amount to allocate to each asset
  // based on the number of assets selected for each category
  const etfAmountPerAsset = etfBudget / etfAssets.length;
  const stockAmountPerAsset = stocksBudget / stockAssets.length;

  const etfsWithAmounts = etfAssets.map((asset) => ({
    ...asset,
    amount: etfAmountPerAsset,
  }));

  const stocksWithAmounts = stockAssets.map((asset) => ({
    ...asset,
    amount: stockAmountPerAsset,
  }));

  const pricedEtfs = await getPrice(etfsWithAmounts);
  const pricedStocks = await getPrice(stocksWithAmounts);

  // group the etf and stocks together with their allocated amounts
  const assets = {
    etf: pricedEtfs,
    stocks: pricedStocks,
  };

  return assets;
};

module.exports = generatePortfolio;
