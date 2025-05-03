const pool = require("../config");

async function getRequestData() {
  const query = `
    SELECT id_request, kode_barang, quantity_diminta, tanggal_request
    FROM requests
    WHERE status = 'Disetujui';
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

// Kembalikan data tanpa clustering manual
async function clusterRequests(req, res) {
  try {
    const rows = await getRequestData();

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Tidak ada data untuk clustering.",
      });
    }

    res.status(200).json({
      status: "success",
      data: rows,
    });
  } catch (error) {
    console.error("Error during clustering:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan saat mengambil data.",
    });
  }
}

module.exports = {
  clusterRequests,
};
