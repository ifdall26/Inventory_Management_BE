const express = require("express");
const router = express.Router();
const pool = require("../config");

// Ambil notifikasi permintaan barang dengan status "Pending"
router.get("/notifications", async (req, res) => {
  try {
    const [pendingRequests] = await pool.query(
      "SELECT id_request, nama_barang, quantity_diminta, id_user, status FROM requests_gudang WHERE status = 'Menunggu Persetujuan Admin'"
    );

    res.json(pendingRequests);
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({ error: "Gagal mengambil notifikasi." });
  }
});

module.exports = router;
