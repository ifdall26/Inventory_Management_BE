const express = require("express");
const router = express.Router();
const clusteringController = require("../controllers/clusteringController");

// Endpoint untuk mendapatkan hasil clustering
router.get("/clustering", clusteringController.clusterRequests);

module.exports = router;
