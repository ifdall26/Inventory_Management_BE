const express = require("express");
const router = express.Router();
const pool = require("../config");

// Statistik total barang per lokasi daerah
router.get("/items-per-daerah", async (req, res) => {
  try {
    const query = `
            SELECT 
                lokasi_daerah, 
                COUNT(*) AS total_items, 
                SUM(quantity) AS total_quantity 
            FROM barang_daerah
            GROUP BY lokasi_daerah
            ORDER BY total_items DESC;
        `;
    const [rows] = await pool.query(query);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching items statistics by daerah:", err);
    res.status(500).json({ error: err.message });
  }
});

// Statistik detail barang per lokasi daerah (tanpa gudang dan lemari)
router.get("/items-per-daerah-area", async (req, res) => {
  const { lokasi_daerah } = req.query;
  if (!lokasi_daerah) {
    return res
      .status(400)
      .json({ error: "Parameter lokasi_daerah diperlukan." });
  }
  try {
    const query = `
            SELECT 
                lokasi_area, 
                COUNT(*) AS total_items, 
                SUM(quantity) AS total_quantity
            FROM barang_daerah
            WHERE lokasi_daerah = ?
            GROUP BY lokasi_area
            ORDER BY lokasi_area ASC;
        `;
    const [rows] = await pool.query(query, [lokasi_daerah]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching detailed statistics:", err);
    res.status(500).json({ error: err.message });
  }
});

// Statistik detail barang per lokasi daerah
router.get("/items-per-daerah-detail", async (req, res) => {
  const { lokasi_daerah } = req.query;
  if (!lokasi_daerah) {
    return res
      .status(400)
      .json({ error: "Parameter lokasi_daerah diperlukan." });
  }
  try {
    const query = `
            SELECT 
                lokasi_area, 
                gudang, 
                lemari, 
                COUNT(*) AS total_items, 
                SUM(quantity) AS total_quantity
            FROM barang_daerah
            WHERE lokasi_daerah = ?
            GROUP BY lokasi_area, gudang, lemari
            ORDER BY lokasi_area ASC, gudang ASC, lemari ASC;
        `;
    const [rows] = await pool.query(query, [lokasi_daerah]);
    res.json(rows);
  } catch (err) {
    console.error("Error fetching detailed statistics:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
