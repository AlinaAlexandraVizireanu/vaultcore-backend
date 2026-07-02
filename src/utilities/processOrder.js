const UserStock = require("../models/UserStock");
const Transactions = require("../models/Transactions");
const ExpressError = require("./ExpressError");

const processOrder = async ({
  userId,
  symbol,
  name,
  quantity,
  price,
  transactionType,
}) => {
  if (!symbol || !name || !quantity || !price || !transactionType) {
    throw new ExpressError("All fields are required", 400);
  }

  if (!["buy", "sell"].includes(transactionType)) {
    throw new ExpressError("Invalid transaction type", 400);
  }

  const existingStock = await UserStock.findOne({
    userId,
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
        userId,
        symbol,
        name,
        quantity,
        averagePrice: price,
      });

      await newStock.save();
    }
  }

  const totalValue = Number((quantity * price).toFixed(2));

  const transaction = new Transactions({
    userId,
    symbol,
    quantity,
    price,
    totalValue,
    transactionType,
  });

  await transaction.save();

  return transaction;
};

module.exports = processOrder;