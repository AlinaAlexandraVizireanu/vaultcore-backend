const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config");

const authMiddleware = (req, res, next) => {
  const authHeader = req.header("Authorization");

  if (!authHeader) {
    return res.status(401).json({ message: "Access Denied" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    req.userId = decoded.userId;

    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid Token" });
  }
};

module.exports = authMiddleware;
