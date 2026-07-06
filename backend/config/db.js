// config/db.js
// MongoDB se connect karta hai. Agar MONGO_URI .env mein nahi hai (ya galat
// hai), server crash NAHI hoga — sirf history/auth features disabled rahenge,
// baaki sab (analyze, jobs) normally kaam karega. Yeh isliye important hai
// taaki tum bina MongoDB setup kiye bhi project chala sako.

const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri || uri.includes("<username>")) {
    console.warn(
      "⚠️  MONGO_URI set nahi hai (.env check karo) — history/auth features kaam nahi karenge, baaki sab normal chalega."
    );
    return false;
  }
  try {
    await mongoose.connect(uri);
    console.log("✅ MongoDB connected");
    return true;
  } catch (err) {
    console.error("⚠️  MongoDB connect nahi ho paya:", err.message);
    console.warn("History/auth features kaam nahi karenge, baaki sab normal chalega.");
    return false;
  }
}

module.exports = connectDB;
