// routes/bookmarks.js
const express = require("express");
const router = express.Router();
const pool = require("../config");

// Get all bookmarks for a user
router.get("/:id_user", async (req, res) => {
  const { id_user } = req.params;
  try {
    const [rows] = await pool.query(
      "SELECT * FROM bookmarks WHERE id_user = ?",
      [id_user]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add bookmark
router.post("/", async (req, res) => {
  const { id_user, kode_barang } = req.body;
  try {
    await pool.query(
      "INSERT INTO bookmarks (id_user, kode_barang) VALUES (?, ?)",
      [id_user, kode_barang]
    );
    res.status(201).json({ message: "Bookmark added successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete bookmark
router.delete("/:id_bookmark", async (req, res) => {
  const { id_bookmark } = req.params;
  try {
    await pool.query("DELETE FROM bookmarks WHERE id_bookmark = ?", [
      id_bookmark,
    ]);
    res.json({ message: "Bookmark deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
