const express = require("express");
const user = require("../controllers/users");
const catchAsync = require("../utilities/catchAsync");
const router = express.Router();

// Register User
router.post("/register", catchAsync(user.registerUser));

// Login User
router.post("/login", catchAsync(user.loginUser));

module.exports = router;
