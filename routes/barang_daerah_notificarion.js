const express = require("express");
const router = express.Router();
const pool = require("../config");

// Endpoint: Notifikasi stok barang habis untuk admin daerah
router.get("/low-stock", async (req, res) => {
  try {
    const [outOfStockItems] = await pool.query(
      `SELECT 
         kode_barang, 
         nama_barang, 
         quantity, 
         lokasi_daerah, 
         lokasi_area, 
         gudang, 
         lemari 
       FROM barang_daerah 
       WHERE quantity = 0`
    );

    res.json(outOfStockItems);
  } catch (error) {
    console.error("Error fetching low-stock notifications for daerah:", error);
    res
      .status(500)
      .json({ error: "Gagal mengambil notifikasi stok habis untuk daerah." });
  }
});

module.exports = router;
