const express = require("express");
const router = express.Router();
const pool = require("../config");

// Endpoint untuk mengambil permintaan yang disetujui dan belum diberi notifikasi
router.get("/unnotification", async (req, res) => {
  const userId = req.query.user_id; // Ambil user_id dari query parameter

  if (!userId) {
    return res.status(400).json({ message: "User ID is required" });
  }

  try {
    const [rows] = await pool.query(
      "SELECT * FROM requests_gudang WHERE (status = 'disetujui' OR status = 'ditolak') AND notified = 0 AND id_user = ?",
      [userId]
    );
    res.json(rows);
  } catch (err) {
    console.error("Database Error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Endpoint untuk menandai permintaan sebagai sudah dilihat (notified = 1)
router.put("/unnotification/:id/mark_as_notified", async (req, res) => {
  const { id } = req.params;
  const userId = req.body.user_id; // Ambil dari body request

  if (!userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const [result] = await pool.query(
      `UPDATE requests_gudang 
       SET notified = 1 
       WHERE id_request = ? 
       AND id_user = ?`, // Pastikan hanya update untuk user terkait
      [id, userId]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: "Request not found or unauthorized" });
    }

    res.status(200).json({ message: "Request marked as notified" });
  } catch (error) {
    console.error("Error marking as notified:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/mark-read", async (req, res) => {
  const { ids, user_id } = req.body;

  if (!user_id) {
    return res.status(401).json({ message: "Unauthorized: Missing user_id" });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ message: "Invalid request data" });
  }

  try {
    // Update notified untuk notifikasi milik user terkait
    const placeholders = ids.map(() => "?").join(",");
    const sql = `UPDATE requests_gudang 
                 SET notified = 1 
                 WHERE id_request IN (${placeholders}) 
                 AND id_user = ?`; // Validasi id_user

    await pool.query(sql, [...ids, user_id]);

    res.json({ message: "Notifications marked as read successfully." });
  } catch (error) {
    console.error("Error marking notifications as read:", error);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
