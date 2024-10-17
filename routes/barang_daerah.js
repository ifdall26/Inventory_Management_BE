const express = require("express");
const router = express.Router();
const multer = require("multer");
const xlsx = require("xlsx");
const pool = require("../config");

// Konfigurasi multer untuk menangani file upload
const upload = multer({ storage: multer.memoryStorage() });

// Get all barang daerah
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM barang_daerah");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint untuk meng-upload file Excel
router.post("/upload_excel", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    // Baca data dari file Excel
    const workbook = xlsx.read(file.buffer, { type: "buffer" });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = xlsx.utils.sheet_to_json(firstSheet); // Konversi ke JSON

    // Simpan data ke database
    for (const row of jsonData) {
      const {
        kode_lokasi,
        kode_barang,
        nama_barang,
        quantity,
        satuan,
        harga_satuan,
        lokasi_daerah,
        lokasi_area,
        tipe_barang,
        gudang,
        lemari,
      } = row;

      const sql = `
        INSERT INTO barang_daerah (kode_lokasi, kode_barang, nama_barang, quantity, satuan, harga_satuan, lokasi_daerah, lokasi_area, tipe_barang, gudang, lemari)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await pool.query(sql, [
        kode_lokasi,
        kode_barang,
        nama_barang,
        quantity,
        satuan,
        harga_satuan,
        lokasi_daerah,
        lokasi_area,
        tipe_barang,
        gudang,
        lemari,
      ]);
    }

    res
      .status(200)
      .json({ message: "Data berhasil diupload dan disimpan ke database." });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: "Terjadi kesalahan saat mengupload file." });
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
    gudang,
    lemari,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO barang_daerah (kode_barang, nama_barang, quantity, satuan, harga_satuan, lokasi_daerah, lokasi_area, tipe_barang, gudang, lemari) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
      [
        kode_barang,
        nama_barang,
        quantity,
        satuan,
        harga_satuan,
        lokasi_daerah,
        lokasi_area,
        tipe_barang,
        gudang,
        lemari,
      ]
    );
    res.status(201).json({ message: "Barang daerah added successfully" });
  } catch (err) {
    console.error("Error adding barang daerah:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Search barang daerah
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
    gudang,
    lemari,
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
        gudang,
        lemari,
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
