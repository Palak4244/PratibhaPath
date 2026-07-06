// middleware/requireDB.js
const mongoose = require("mongoose");

function requireDB(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      error: "This feature needs MongoDB to be connected. Add MONGO_URI in backend/.env (see README).",
    });
  }
  next();
}

module.exports = requireDB;
