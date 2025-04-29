// routes/users.js
const express = require("express");
const router = express.Router();
const pool = require("../config");
const bcrypt = require("bcrypt"); // import bcrypt

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

    // Role diatur default sebagai 'User Area'
    const role = "User Area";

    // Buat hash dari password menggunakan bcrypt
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Masukkan user baru ke dalam database dengan password yang telah di-hash
    await pool.query(
      "INSERT INTO users (nama, email, password, role) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, role]
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

    // Bandingkan password yang diberikan dengan hash yang disimpan
    const isPasswordValid = await bcrypt.compare(password, user[0].password);
    if (!isPasswordValid) {
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

// Hash semua password yang belum di-hash
router.put("/rehash/all", async (req, res) => {
  try {
    const [users] = await pool.query("SELECT id_user, password FROM users");

    const saltRounds = 10;
    let updatedCount = 0;

    for (let user of users) {
      // Deteksi password yang belum di-hash (misalnya panjangnya < 60 karakter)
      if (user.password.length < 60) {
        const hashed = await bcrypt.hash(user.password, saltRounds);
        await pool.query("UPDATE users SET password = ? WHERE id_user = ?", [
          hashed,
          user.id_user,
        ]);
        updatedCount++;
      }
    }

    res.json({
      message: `Password hashing completed.`,
      updatedPasswords: updatedCount,
    });
  } catch (err) {
    console.error("Error during password rehash:", err);
    res.status(500).json({ error: "Failed to rehash passwords." });
  }
});

module.exports = router;
