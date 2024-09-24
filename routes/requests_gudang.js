const express = require("express");
const router = express.Router();
const pool = require("../config");

// Get all requests_gudang
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM requests_gudang");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests_gudang by ID
router.get("/:id_request", async (req, res) => {
  const { id_request } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM requests_gudang WHERE id_request = ?",
      [id_request]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests_gudang by user ID
router.get("/user/:id_user", async (req, res) => {
  const { id_user } = req.params;
  console.log(`Fetching requests_gudang for user with id_user: ${id_user}`);

  try {
    const [rows] = await pool.query(
      "SELECT * FROM requests_gudang WHERE id_user = ?",
      [Number(id_user)]
    );

    console.log("Query result:", rows);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests_gudang found for this user" });
    }

    res.json(rows);
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).json({ error: err.message });
  }
});

// Menambahkan permintaan gudang
router.post("/", async (req, res) => {
  const { nama_user, quantity_diminta, status, catatan, id_user, nama_barang } =
    req.body;

  try {
    const sql = `INSERT INTO requests_gudang (nama_user, quantity_diminta, status, catatan, id_user, nama_barang) 
               VALUES (?, ?, ?, ?, ?, ?)`;

    const [result] = await pool.query(sql, [
      nama_user,
      quantity_diminta,
      status,
      catatan,
      id_user,
      nama_barang,
    ]);

    res.status(201).json({
      message: "Request added successfully",
      id_request: result.insertId,
    });
  } catch (err) {
    console.error("Error inserting request:", err);
    res.status(500).json({ error: "Database error" });
  }
});

// Delete request
router.delete("/:id_request", async (req, res) => {
  const { id_request } = req.params;
  try {
    await pool.query("DELETE FROM requests_gudang WHERE id_request = ?", [
      id_request,
    ]);
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update status request (Persetujuan)
router.put("/:id_request/approve", async (req, res) => {
  const { id_request } = req.params;
  const { status } = req.body; // Status bisa "Disetujui"

  // Validasi status
  if (status !== "Disetujui") {
    return res.status(400).json({ message: "Status tidak valid" });
  }

  try {
    // Cek apakah request dengan id_request tersebut ada
    const [requestRows] = await pool.query(
      "SELECT * FROM requests_gudang WHERE id_request = ?",
      [id_request]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ message: "Request tidak ditemukan" });
    }

    const request = requestRows[0];
    const { quantity_diminta, nama_barang } = request;

    // Update status request
    await pool.query(
      "UPDATE requests_gudang SET status = ? WHERE id_request = ?",
      [status, id_request]
    );

    // Update stok barang di tabel barang_gudang
    const [barangRows] = await pool.query(
      "SELECT * FROM barang_gudang WHERE nama_barang = ?",
      [nama_barang]
    );

    if (barangRows.length === 0) {
      return res
        .status(404)
        .json({ message: "Barang tidak ditemukan di tabel barang_gudang" });
    }

    const barang = barangRows[0];
    const newQuantity = barang.quantity - quantity_diminta;

    if (newQuantity < 0) {
      return res.status(400).json({ message: "Stok tidak cukup" });
    }

    await pool.query(
      "UPDATE barang_gudang SET quantity = ? WHERE nama_barang = ?",
      [newQuantity, nama_barang]
    );

    res.json({
      message:
        "Status permintaan berhasil diperbarui dan stok barang diperbarui",
    });
  } catch (err) {
    console.error("Error updating request status and stock:", err);
    res.status(500).json({ error: err.message });
  }
});

// Update status request (Penolakan)
router.put("/:id_request/reject", async (req, res) => {
  const { id_request } = req.params;
  const { status, catatan } = req.body; // Status harus "Ditolak" dan catatan alasan penolakan

  // Validasi status
  if (status !== "Ditolak") {
    return res.status(400).json({ message: "Status tidak valid" });
  }

  try {
    const [requestRows] = await pool.query(
      "SELECT * FROM requests_gudang WHERE id_request = ?",
      [id_request]
    );

    if (requestRows.length === 0) {
      return res.status(404).json({ message: "Request tidak ditemukan" });
    }

    await pool.query(
      "UPDATE requests_gudang SET status = ?, catatan = ? WHERE id_request = ?",
      [status, catatan, id_request]
    );

    res.json({ message: "Status permintaan berhasil diperbarui" });
  } catch (err) {
    console.error("Error updating request status:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
