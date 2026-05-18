const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    investmentProfile: {
      riskLevel: {
        type: String,
        enum: ["low", "medium", "high"],
      },
      interests: [String],
      budget: Number,
      goal: {
        type: String,
        enum: ["growth", "income", "balanced"],
      },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("User", UserSchema);
