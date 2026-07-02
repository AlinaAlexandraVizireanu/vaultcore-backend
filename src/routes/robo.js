const express = require("express");
const robo = require("../controllers/robo");
const catchAsync = require("../utilities/catchAsync");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();

// Route: Create User profile
router.post("/profile", authMiddleware, catchAsync(robo.updateInvestmentProfile));

// Route: Generate recommendations
router.get("/recommendations", authMiddleware, catchAsync(robo.generateRecommendations));

// Route: Confirm recommendations by generating orders
router.post("/confirm", authMiddleware, catchAsync(robo.confirmRecommendations));

module.exports = router;
