// routes/transactions.js
const express = require("express");
const router = express.Router();
const pool = require("../config");

// Get all transactions
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM transactions");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get transaction by ID
router.get("/:id_transaksi", async (req, res) => {
  const { id_transaksi } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM transactions WHERE id_transaksi = ?",
      [id_transaksi]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new transaction (masuk atau keluar)
router.post("/", async (req, res) => {
  const { id_request, kode_barang, jumlah_transaksi, jenis_transaksi } =
    req.body;
  try {
    await pool.query(
      "INSERT INTO transactions (id_request, kode_barang, tanggal_transaksi, jumlah_transaksi, jenis_transaksi) VALUES (?, ?, CURDATE(), ?, ?)",
      [id_request, kode_barang, jumlah_transaksi, jenis_transaksi]
    );
    res.status(201).json({ message: "Transaction created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
