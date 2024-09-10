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
  const { name, email, password } = req.body;

  // Cek apakah semua data yang dibutuhkan sudah lengkap
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Cek apakah user dengan email yang sama sudah ada
    const [existingUser] = await pool.query(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );
    if (existingUser.length > 0) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Role diatur default sebagai 'User'
    const role = "User Area";

    // Masukkan user baru ke dalam database
    await pool.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, password, role]
    );

    return res.status(201).json({ message: "User registered successfully!" });
  } catch (error) {
    console.error("Error registering user:", error);
    return res
      .status(500)
      .json({ message: "An error occurred during registration." });
  }
});

// Route untuk login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Cek apakah semua data yang dibutuhkan sudah lengkap
  if (!email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Cari user berdasarkan email
    const [user] = await pool.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);

    // Cek apakah user ditemukan
    if (user.length === 0) {
      return res.status(404).json({ message: "User not found." });
    }

    // Cek apakah password cocok
    if (user[0].password !== password) {
      return res.status(401).json({ message: "Invalid password." });
    }

    // Jika login berhasil, kirim data user kecuali password
    const { id_user, nama, role } = user[0];
    return res.status(200).json({ id_user, nama, email, role });
  } catch (error) {
    console.error("Error during login:", error);
    return res.status(500).json({ message: "An error occurred during login." });
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
