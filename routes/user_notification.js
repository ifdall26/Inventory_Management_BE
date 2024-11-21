const express = require("express");
const router = express.Router();
const pool = require("../config");

// Endpoint untuk mengambil permintaan yang disetujui dan belum diberi notifikasi
router.get("/unnotification", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM requests_gudang WHERE (status = 'disetujui' OR status = 'ditolak') AND notified = 0"
    );
    console.log("Query Result:", rows); // Tambahkan log untuk hasil query
    res.json(rows);
  } catch (err) {
    console.error("Database Error:", err); // Tambahkan log untuk error
    res.status(500).json({ error: err.message });
  }
});

// Endpoint untuk menandai permintaan sebagai sudah dilihat (notified = 1)
router.put("/unnotification/:id/mark_as_notified", async (req, res) => {
  const { id } = req.params;

  try {
    // Update status notified menjadi 1 untuk menandai sudah dilihat
    const result = await db.query(
      "UPDATE requests_gudang SET notified = 1 WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Request not found" });
    }

    res.status(200).json({ message: "Request marked as notified" });
  } catch (error) {
    console.error("Error marking as notified:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/mark-read", async (req, res) => {
  const { ids } = req.body;

  try {
    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const placeholders = ids.map(() => "?").join(",");
    const sql = `UPDATE requests_gudang SET notified = 1 WHERE id_request IN (${placeholders})`;

    await pool.query(sql, ids);
    res.json({ message: "Notifications marked as read successfully." });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
