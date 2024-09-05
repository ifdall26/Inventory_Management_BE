// routes/users.js
const express = require("express");
const router = express.Router();
const pool = require("../config");

// Get all users
router.get("/", async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get("/:id_user", async (req, res) => {
  const { id_user } = req.params;
  try {
    const [rows] = await pool.query("SELECT * FROM users WHERE id_user = ?", [
      id_user,
    ]);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Create new user
router.post("/", async (req, res) => {
  const { nama, email, password, role } = req.body;
  try {
    await pool.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [nama, email, password, role]
    );
    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user
router.put("/:id_user", async (req, res) => {
  const { id_user } = req.params;
  const { nama, email, role } = req.body;
  try {
    await pool.query(
      "UPDATE users SET nama = ?, email = ?, role = ? WHERE id_user = ?",
      [nama, email, role, id_user]
    );
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete("/:id_user", async (req, res) => {
  const { id_user } = req.params;
  try {
    // Cek apakah user ada
    const [rows] = await pool.query("SELECT * FROM users WHERE id_user = ?", [
      id_user,
    ]);

    // Jika user tidak ditemukan
    if (rows.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hapus user jika ada
    await pool.query("DELETE FROM users WHERE id_user = ?", [id_user]);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
