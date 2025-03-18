const User = require("../models/User");
const ExpressError = require("../utilities/ExpressError");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

module.exports.registerUser = async (req, res) => {
  const { name, email, password } = req.body;

  // Check if user exists
  let user = await User.findOne({ email });
  if (user) throw new ExpressError("User already exists", 400);

  // Hash password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create new user
  user = new User({ name, email, password: hashedPassword });
  await user.save();

  // Generate token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.status(201).json({ token, user: { id: user._id, name, email } });
};

module.exports.loginUser = async (req, res) => {
  const { email, password } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) throw new ExpressError("Invalid credentials", 400);

  // Compare passwords
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new ExpressError("Invalid credentials", 400);

  // Generate token
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, {
    expiresIn: "1h",
  });

  res.json({
    token,
    user: { id: user._id, name: user.name, email: user.email },
  });
};
