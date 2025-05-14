const express = require("express");
const router = express.Router();
const pool = require("../config");

// Get all requests
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM requests");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get request by ID
router.get("/:id_request", async (req, res) => {
  const { id_request } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM requests WHERE id_request = ?",
      [id_request]
    );
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get requests by user ID
router.get("/user/:id_user", async (req, res) => {
  const { id_user } = req.params;
  console.log(`Fetching requests for user with id_user: ${id_user}`);

  try {
    // Query untuk mengambil data request berdasarkan id_user
    const [rows] = await pool.query(
      "SELECT * FROM requests WHERE id_user = ?",
      [Number(id_user)] // Pastikan id_user berupa angka
    );

    console.log("Query result:", rows);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests found for this user" });
    }

    res.json(rows); // Kirim hasil query sebagai JSON
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create new request and update stock
router.post("/", async (req, res) => {
  const {
    kode_lokasi,
    kode_barang,
    nama_user,
    quantity_diminta,
    status,
    catatan,
    id_user,
  } = req.body;

  // Validasi field yang wajib
  if (
    !kode_lokasi ||
    !kode_barang ||
    !nama_user ||
    !quantity_diminta ||
    !status ||
    !id_user
  ) {
    return res.status(400).json({ error: "All fields are required." });
  }

  // Validasi quantity
  if (isNaN(quantity_diminta) || quantity_diminta <= 0) {
    return res.status(400).json({ error: "Invalid quantity requested." });
  }

  try {
    await pool.query("START TRANSACTION");

    // Cek stok berdasarkan kode_lokasi
    const [barang] = await pool.query(
      "SELECT quantity FROM barang_daerah WHERE kode_lokasi = ?",
      [kode_lokasi]
    );

    if (barang.length === 0) {
      throw new Error("Barang tidak ditemukan.");
    }

    if (barang[0].quantity < quantity_diminta) {
      throw new Error("Stok barang tidak mencukupi.");
    }

    // Insert ke tabel requests (tanpa kode_lokasi karena tidak ada kolom tersebut)
    await pool.query(
      "INSERT INTO requests (kode_barang, nama_user, quantity_diminta, status, tanggal_request, catatan, id_user) VALUES (?, ?, ?, ?, CURDATE(), ?, ?)",
      [kode_barang, nama_user, quantity_diminta, status, catatan, id_user]
    );

    // Update stok barang
    const [result] = await pool.query(
      "UPDATE barang_daerah SET quantity = quantity - ? WHERE kode_lokasi = ?",
      [quantity_diminta, kode_lokasi]
    );

    if (result.affectedRows === 0) {
      throw new Error("Barang tidak ditemukan atau stok tidak mencukupi.");
    }

    await pool.query("COMMIT");
    res.status(201).json({
      message: "Request created successfully and stock updated.",
      kode_barang,
      quantity_diminta,
    });
  } catch (err) {
    await pool.query("ROLLBACK");
    console.error("Error during request creation and stock update:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete request
router.delete("/:id_request", async (req, res) => {
  const { id_request } = req.params;
  try {
    await pool.query("DELETE FROM requests WHERE id_request = ?", [id_request]);
    res.json({ message: "Request deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Endpoint untuk mendapatkan barang yang paling sering diminta
router.get("/statistics/most-requested", async (req, res) => {
  try {
    console.log("Endpoint hit: /statistics/most-requested");

    const query = `
      SELECT 
        kode_barang, 
        COUNT(*) AS frequency, 
        SUM(quantity_diminta) AS total_quantity 
      FROM requests
      WHERE status = 'Disetujui'
      GROUP BY kode_barang
      ORDER BY frequency DESC
      LIMIT 5
    `;
    console.log("Executing query:", query);

    // Use pool.query instead of db.query
    const [rows] = await pool.query(query); // This line was incorrect
    console.log("Query result:", rows);

    res.json(rows);
  } catch (err) {
    console.error("Error occurred in /statistics/most-requested:", err);
    res.status(500).json({ error: "Failed to fetch statistics." });
  }
});

module.exports = router;
