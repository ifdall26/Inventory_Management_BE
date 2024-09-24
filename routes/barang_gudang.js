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

// Get item by name
router.get("/by-name/:name", async (req, res) => {
  const { name } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM barang_gudang WHERE nama_barang = ?",
      [name]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(rows[0]); // Kirim hasil query sebagai JSON
  } catch (err) {
    console.error("Error querying item by name:", err);
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

router.put("/:kode_barang", async (req, res) => {
  const { kode_barang } = req.params;
  const { nama_barang, quantity, satuan, harga_satuan, tipe_barang } = req.body;

  // Debug: Print the updated item data
  console.log("Updating item with data:", {
    nama_barang,
    quantity,
    satuan,
    harga_satuan,
    tipe_barang,
  });

  try {
    const [result] = await pool.query(
      "UPDATE barang_gudang SET nama_barang = ?, quantity = ?, satuan = ?, harga_satuan = ?, tipe_barang = ? WHERE kode_barang = ?",
      [nama_barang, quantity, satuan, harga_satuan, tipe_barang, kode_barang]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json({ message: "Item updated successfully" });
  } catch (err) {
    console.error("Error updating item:", err.message);
    res.status(500).json({ error: err.message });
  }
});

// Update item stock by name
router.put("/by-name/:name", async (req, res) => {
  const { name } = req.params;
  const { quantity } = req.body;

  try {
    const [itemRows] = await pool.query(
      "SELECT kode_barang, quantity FROM barang_gudang WHERE nama_barang = ?",
      [name]
    );

    if (itemRows.length === 0) {
      return res.status(404).json({ message: "Item not found" });
    }

    const { kode_barang, quantity: currentQuantity } = itemRows[0];
    const newQuantity = currentQuantity - quantity;

    if (newQuantity < 0) {
      return res.status(400).json({ message: "Insufficient stock" });
    }

    await pool.query(
      "UPDATE barang_gudang SET quantity = ? WHERE kode_barang = ?",
      [newQuantity, kode_barang]
    );

    res.json({ message: "Stock updated successfully" });
  } catch (err) {
    console.error("Error updating stock:", err);
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
