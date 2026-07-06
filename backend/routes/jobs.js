// routes/jobs.js
const express = require("express");
const router = express.Router();
const { getJobs } = require("../controllers/jobsController");

// GET /api/jobs?skills=javascript,react,node
router.get("/jobs", getJobs);

module.exports = router;
