// routes/barang_daerah.js
const express = require("express");
const router = express.Router();
const pool = require("../config");

// Get all barang daerah
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM barang_daerah");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get barang daerah by kode_barang
router.get("/:kode_barang", async (req, res) => {
  const { kode_barang } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM barang_daerah WHERE kode_barang = ?",
      [kode_barang]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new barang daerah
router.post("/", async (req, res) => {
  const {
    kode_barang,
    nama_barang,
    quantity,
    satuan,
    harga_satuan,
    lokasi_daerah,
    lokasi_area,
    tipe_barang,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO barang_daerah (kode_barang, nama_barang, quantity, satuan, harga_satuan, lokasi_daerah, lokasi_area, tipe_barang) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        kode_barang,
        nama_barang,
        quantity,
        satuan,
        harga_satuan,
        lokasi_daerah,
        lokasi_area,
        tipe_barang,
      ]
    );
    res.status(201).json({ message: "Barang daerah added successfully" });
  } catch (err) {
    console.error("Error adding barang daerah:", err.message); // Tambahkan logging error
    res.status(500).json({ error: err.message });
  }
});

router.get("/search", async (req, res) => {
  const { tipe_barang, lokasi_daerah, lokasi_area, gudang, lemari } = req.query;

  try {
    let query = "SELECT * FROM barang_daerah WHERE 1=1";
    const params = [];

    if (tipe_barang) {
      query += " AND tipe_barang = ?";
      params.push(tipe_barang);
    }

    if (lokasi_daerah) {
      query += " AND lokasi_daerah = ?";
      params.push(lokasi_daerah);
    }

    if (lokasi_area) {
      query += " AND lokasi_area = ?";
      params.push(lokasi_area);
    }

    if (gudang) {
      query += " AND gudang = ?";
      params.push(gudang);
    }

    if (lemari) {
      query += " AND lemari = ?";
      params.push(lemari);
    }

    const [rows] = await pool.query(query, params);

    // Pastikan respons berupa array (meskipun kosong)
    res.json(rows.length ? rows : []);
  } catch (err) {
    console.error("Error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update barang daerah
router.put("/:kode_barang", async (req, res) => {
  const { kode_barang } = req.params;
  const {
    nama_barang,
    quantity,
    satuan,
    harga_satuan,
    lokasi_daerah,
    lokasi_area,
    tipe_barang,
  } = req.body;
  try {
    await pool.query(
      "UPDATE barang_daerah SET nama_barang = ?, quantity = ?, satuan = ?, harga_satuan = ?, lokasi_daerah = ?, lokasi_area = ?, tipe_barang = ? WHERE kode_barang = ?",
      [
        nama_barang,
        quantity,
        satuan,
        harga_satuan,
        lokasi_daerah,
        lokasi_area,
        tipe_barang,
        kode_barang,
      ]
    );
    res.json({ message: "Barang daerah updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete barang daerah
router.delete("/:kode_barang", async (req, res) => {
  const { kode_barang } = req.params;
  try {
    await pool.query("DELETE FROM barang_daerah WHERE kode_barang = ?", [
      kode_barang,
    ]);
    res.json({ message: "Barang daerah deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
