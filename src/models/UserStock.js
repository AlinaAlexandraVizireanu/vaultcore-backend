const mongoose = require("mongoose");

const userStockSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Reference to User model
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    purchasePrice: {
      type: Number,
      required: true,
    },
    purchaseDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("UserStock", userStockSchema);
