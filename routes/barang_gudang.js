// routes/barang_gudang.js
const express = require("express");
const router = express.Router();
const pool = require("../config");

// Get all barang_gudang
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM barang_gudang");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get item by kode_barang
router.get("/:kode_barang", async (req, res) => {
  const { kode_barang } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM barang_gudang WHERE kode_barang = ?",
      [kode_barang]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new item
router.post("/", async (req, res) => {
  const {
    kode_barang,
    nama_barang,
    quantity,
    satuan,
    harga_satuan,
    tipe_barang,
  } = req.body;
  try {
    await pool.query(
      "INSERT INTO barang_gudang (kode_barang, nama_barang, quantity, satuan, harga_satuan, tipe_barang) VALUES (?, ?, ?, ?, ?, ?)",
      [kode_barang, nama_barang, quantity, satuan, harga_satuan, tipe_barang]
    );
    res.status(201).json({ message: "Item added successfully" });
  } catch (err) {
    console.error("Error adding item:", err.message); // Tambahkan logging error
    res.status(500).json({ error: err.message });
  }
});

// Update item
router.put("/:kode_barang", async (req, res) => {
  const { kode_barang } = req.params;
  const { nama_barang, quantity, satuan, harga_satuan, tipe_barang } = req.body;
  try {
    await pool.query(
      "UPDATE barang_gudang SET nama_barang = ?, quantity = ?, satuan = ?, harga_satuan = ?, tipe_barang = ? WHERE kode_barang = ?",
      [nama_barang, quantity, satuan, harga_satuan, kode_barang, tipe_barang]
    );
    res.json({ message: "Item updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete item
router.delete("/:kode_barang", async (req, res) => {
  const { kode_barang } = req.params;
  try {
    await pool.query("DELETE FROM barang_gudang WHERE kode_barang = ?", [
      kode_barang,
    ]);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
