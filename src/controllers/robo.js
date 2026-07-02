const User = require("../models/User");
const ExpressError = require("../utilities/ExpressError");
const generatePortfolio = require("../utilities/generatePortfolio");
const getPrice = require("../utilities/getPrice");
const processOrder = require("../utilities/processOrder");

function normalizeAssets(assets) {
  if (Array.isArray(assets)) return assets;
  if (assets && typeof assets === "object") return Object.values(assets).flat();
  return [];
}

module.exports.updateInvestmentProfile = async (req, res) => {
  const userId = req.userId;
  const { riskLevel, interests, budget, goal } = req.body;

  if (interests.length === 0 || budget === null || budget === 0)
    throw new ExpressError("interests and budget are required", 400);

  const user = await User.findById(userId);

  if (!user) throw new ExpressError("User not found", 404);

  user.investmentProfile = {
    riskLevel,
    interests,
    budget,
    goal,
  };

  await user.save();

  return res.status(200).json({
    message: "Investment profile saved successfully",
    investmentProfile: user.investmentProfile,
  });
};

module.exports.generateRecommendations = async (req, res) => {
  const userId = req.userId;
  const user = await User.findById(userId);

  if (!user || !user.investmentProfile)
    throw new ExpressError("User or investment profile not found", 404);

  const recommendedAssets = await generatePortfolio(user.investmentProfile);

  return res.status(200).json({
    message: "Recommendations generated successfully",
    recommendedAssets,
  });
};

module.exports.confirmRecommendations = async (req, res) => {
  const { recommendedAssets } = req.body;

  const assetsToConfirm = [...recommendedAssets.etf, ...recommendedAssets.stocks];
  
  const transactions = [];

  for (const asset of assetsToConfirm) {
    const { symbol, name, price, quantity } = asset;

    if (!symbol || !name || !price || !quantity) {
      throw new ExpressError(
        "Each asset must include symbol, name, price, and quantity",
        400,
      );
    }

    const transaction = await processOrder({
      userId: req.userId,
      symbol,
      name,
      quantity,
      price,
      transactionType: "buy",
    });

    transactions.push(transaction);
  }

  return res.status(201).json({
    message: "AI recommendation confirmed successfully",
    transactions,
  });
};
