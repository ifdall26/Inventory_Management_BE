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

// Create new request
router.post("/", async (req, res) => {
  const { kode_barang, nama_user, quantity_diminta, status, catatan, id_user } =
    req.body;
  console.log("Received data:", {
    kode_barang,
    nama_user,
    quantity_diminta,
    status,
    catatan,
    id_user,
  });

  try {
    await pool.query(
      "INSERT INTO requests (kode_barang, nama_user, quantity_diminta, status, tanggal_request, catatan, id_user) VALUES (?, ?, ?, ?, CURDATE(), ?, ?)",
      [kode_barang, nama_user, quantity_diminta, status, catatan, id_user]
    );
    res.status(201).json({ message: "Request created successfully" });
  } catch (err) {
    console.error("Error during request creation:", err);
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

module.exports = router;
