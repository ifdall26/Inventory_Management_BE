// routes/items.js
const express = require("express");
const router = express.Router();
const pool = require("../config");

// Get all items
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM items");
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
      "SELECT * FROM items WHERE kode_barang = ?",
      [kode_barang]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add new item
router.post("/", async (req, res) => {
  const { kode_barang, nama_barang, quantity, satuan, harga_satuan } = req.body;
  try {
    await pool.query(
      "INSERT INTO items (kode_barang, nama_barang, quantity, satuan, harga_satuan) VALUES (?, ?, ?, ?, ?)",
      [kode_barang, nama_barang, quantity, satuan, harga_satuan]
    );
    res.status(201).json({ message: "Item added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update item
router.put("/:kode_barang", async (req, res) => {
  const { kode_barang } = req.params;
  const { nama_barang, quantity, satuan, harga_satuan } = req.body;
  try {
    await pool.query(
      "UPDATE items SET nama_barang = ?, quantity = ?, satuan = ?, harga_satuan = ? WHERE kode_barang = ?",
      [nama_barang, quantity, satuan, harga_satuan, kode_barang]
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
    await pool.query("DELETE FROM items WHERE kode_barang = ?", [kode_barang]);
    res.json({ message: "Item deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
