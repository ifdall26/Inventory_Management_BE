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

// Update request status
router.put("/:id_request/status", async (req, res) => {
  const { id_request } = req.params;
  const { status } = req.body;

  try {
    await pool.query("UPDATE requests SET status = ? WHERE id_request = ?", [
      status,
      id_request,
    ]);

    if (status === "approved") {
      const [request] = await pool.query(
        "SELECT kode_barang, quantity_diminta FROM requests WHERE id_request = ?",
        [id_request]
      );
      const { kode_barang, quantity_diminta } = request[0];

      await pool.query(
        "UPDATE items SET quantity = quantity - ? WHERE kode_barang = ?",
        [quantity_diminta, kode_barang]
      );
    }

    res.json({
      message: "Request status updated and stock adjusted successfully",
    });
  } catch (err) {
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
