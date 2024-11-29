const express = require("express");
const router = express.Router();
const { clusterRequests } = require("../controllers/clusteringController");

// Endpoint clustering
router.post("/clustering", clusterRequests);

module.exports = router;
