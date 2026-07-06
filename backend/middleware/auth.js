// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Routes ke liye jahan login zaroori hai (jaise /api/history)
async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Login required. Please sign in." });
  }
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(401).json({ error: "User not found." });
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }
}

// Routes ke liye jahan login OPTIONAL hai (jaise /api/analyze) — agar token
// valid hai to req.user set ho jaata hai (history save ho sakti hai), agar
// nahi hai to bhi request normally chalti hai (anonymous use allowed)
async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith("Bearer ")) return next();
  try {
    const token = header.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    if (user) req.user = user;
  } catch (err) {
    // Invalid token ho to bhi silently ignore karo, anonymous treat karo
  }
  next();
}

module.exports = { protect, optionalAuth };
