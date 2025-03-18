const express = require("express");
const users = require("../controllers/users");
const catchAsync = require("../utilities/catchAsync");
const router = express.Router();

// Register User
router.post("/register", catchAsync(users.registerUser));

// Login User
router.post("/login", catchAsync(users.loginUser));

module.exports = router;
