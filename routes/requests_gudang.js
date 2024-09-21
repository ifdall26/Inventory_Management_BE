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
    // Query untuk mengambil data request berdasarkan id_user
    const [rows] = await pool.query(
      "SELECT * FROM requests_gudang WHERE id_user = ?",
      [Number(id_user)] // Pastikan id_user berupa angka
    );

    console.log("Query result:", rows);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ message: "No requests_gudang found for this user" });
    }

    res.json(rows); // Kirim hasil query sebagai JSON
  } catch (err) {
    console.error("Error querying database:", err);
    res.status(500).json({ error: err.message });
  }
});

// Menambahkan permintaan gudang
router.post("/", async (req, res) => {
  const { nama_user, quantity_diminta, status, catatan, id_user } = req.body;

  try {
    const sql = `INSERT INTO requests_gudang (nama_user, quantity_diminta, status, catatan, id_user) 
               VALUES (?, ?, ?, ?, ?)`;

    const [result] = await pool.query(sql, [
      nama_user,
      quantity_diminta,
      status,
      catatan,
      id_user,
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

module.exports = router;
