const pool = require("../config");

// Fungsi untuk mengambil data dari database (GET)
async function getRequestData() {
  const query = `
    SELECT id_request, kode_barang, quantity_diminta, tanggal_request
    FROM requests
    WHERE status = 'Disetujui';
  `;
  const [rows] = await pool.execute(query);
  return rows;
}

// Fungsi untuk mengelompokkan data berdasarkan quantity_diminta
function customClusterRequests(data) {
  return data.map((request) => {
    let cluster;
    // Tentukan cluster berdasarkan quantity_diminta
    if (request.quantity_diminta < 5) {
      cluster = 1;
    } else if (
      request.quantity_diminta >= 5 &&
      request.quantity_diminta <= 10
    ) {
      cluster = 2;
    } else {
      cluster = 3;
    }
    return { ...request, cluster }; // Menambahkan cluster pada data request
  });
}

// Fungsi untuk clustering data dari database
async function clusterRequests(req, res) {
  try {
    const rows = await getRequestData();

    if (!rows || rows.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Tidak ada data untuk clustering.",
      });
    }

    // Lakukan clustering dengan logika manual berdasarkan quantity_diminta
    const clusteredData = customClusterRequests(rows);

    // Kirim respons dengan hasil clustering
    res.status(200).json({
      status: "success",
      data: clusteredData,
    });
  } catch (error) {
    console.error("Error during clustering:", error);
    res.status(500).json({
      status: "error",
      message: error.message || "Terjadi kesalahan selama clustering.",
    });
  }
}

module.exports = {
  clusterRequests,
};
