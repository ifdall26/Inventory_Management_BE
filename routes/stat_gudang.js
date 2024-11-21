const express = require("express");
const router = express.Router();
const pool = require("../config");

// Statistik Barang dan Permintaan
router.get("/statistics", async (req, res) => {
  try {
    // Total Jumlah Barang
    const [totalQuantity] = await pool.query(
      "SELECT SUM(quantity) AS total_quantity FROM barang_gudang"
    );

    // Jumlah Barang Berdasarkan Tipe
    const [typeStats] = await pool.query(
      "SELECT tipe_barang, SUM(quantity) AS total_quantity FROM barang_gudang GROUP BY tipe_barang"
    );

    // Jumlah Permintaan Berdasarkan Status
    const [requestStats] = await pool.query(
      "SELECT status, COUNT(*) AS total_requests FROM requests_gudang GROUP BY status"
    );

    res.json({
      totalQuantity: totalQuantity[0]?.total_quantity || 0,
      typeStats,
      requestStats,
    });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
