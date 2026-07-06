require("dotenv").config();
const express = require("express");
const cors = require("cors");
const analyzeRoutes = require("./routes/analyze");
const jobsRoutes = require("./routes/jobs");
const aiRoutes = require("./routes/ai");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => res.json({ message: "PratibhaPath backend is running ✅" }));

// Core routes — no MongoDB required
app.use("/api", analyzeRoutes);
app.use("/api", jobsRoutes);
app.use("/api", aiRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message });
});

app.listen(PORT, () => {
  console.log(`\n🚀 PratibhaPath backend running on http://localhost:${PORT}`);
  if (!process.env.HF_API_KEY) console.log("⚠️  HF_API_KEY not set — AI suggestions will prompt for setup");
  if (!process.env.ADZUNA_APP_ID) console.log("⚠️  ADZUNA keys not set — using Arbeitnow fallback for jobs");
});
