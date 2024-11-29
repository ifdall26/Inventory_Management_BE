const pool = require("../config"); // Koneksi database
const moment = require("moment");
const KMeans = require("kmeans-js"); // Menggunakan kmeans-js

// Fungsi untuk mengambil data dari database
async function getRequestData() {
  const query = `
        SELECT id_request, kode_barang, quantity_diminta, tanggal_request
        FROM requests
        WHERE status = 'Disetujui';
    `;
  const [rows] = await pool.execute(query);
  return rows;
}

// Fungsi untuk memproses data (ubah tanggal menjadi numerik)
function processRequestData(data) {
  return data.map((req) => ({
    id_request: req.id_request,
    kode_barang: req.kode_barang,
    quantity_diminta: req.quantity_diminta,
    day_of_year: moment(req.tanggal_request).dayOfYear(), // Konversi tanggal ke hari dalam tahun
  }));
}

// Fungsi untuk normalisasi data
function normalizeData(data) {
  const maxValues = data[0].map((_, i) =>
    Math.max(...data.map((row) => row[i]))
  );

  return data.map((row) => row.map((value, index) => value / maxValues[index]));
}

// Fungsi untuk melakukan clustering
async function performClustering(data, k = 3) {
  return new Promise((resolve, reject) => {
    try {
      console.log("Data sebelum clustering:", data); // Debugging
      const kmeans = new KMeans(k); // Inisialisasi KMeans
      const clusters = kmeans.cluster(data); // Hasil clustering

      console.log("Hasil clusters:", clusters); // Debugging

      // Pastikan hanya label cluster yang diambil
      const clusteredData = data.map((item, index) => ({
        ...item,
        cluster: clusters[index]?.cluster || clusters[index], // Sesuaikan sesuai struktur hasil cluster
      }));

      resolve(clusteredData);
    } catch (error) {
      console.error("Error during clustering:", error);
      reject(error);
    }
  });
}

// Fungsi utama untuk clustering
async function clusterRequests(req, res) {
  try {
    // Ambil data dari database
    const requestData = await getRequestData();
    console.log("Ambil data request selesai:", requestData.length);

    // Proses data untuk clustering
    const processedData = processRequestData(requestData);
    console.log("Proses data selesai:", processedData.length);

    // Data numerik untuk clustering
    const clusteringInput = processedData.map((d) => [
      d.quantity_diminta, // Fitur 1: quantity diminta
      d.day_of_year, // Fitur 2: hari dalam tahun
    ]);

    console.log("Data input untuk clustering:", clusteringInput); // Debugging: cek data yang akan diproses lebih lanjut

    // Normalisasi data sebelum clustering
    const normalizedData = normalizeData(clusteringInput);
    console.log("Data setelah normalisasi:", normalizedData); // Debugging: cek data setelah normalisasi

    // Lakukan clustering dan tunggu hasilnya
    const clusters = await performClustering(normalizedData, 3); // Gunakan await untuk menunggu hasil

    // Gabungkan hasil cluster dengan data asli
    const clusteredData = processedData.map((item, index) => ({
      ...item,
      cluster: clusters[index], // Tambahkan hasil cluster pada setiap data
    }));

    // Kirim hasil ke frontend
    res.json(clusteredData);
  } catch (error) {
    console.error("Error occurred during clustering:", error.message); // Menangani error dengan lebih jelas
    res.status(500).send("Error performing clustering"); // Response error ke frontend
  }
}

module.exports = { clusterRequests }; // Ekspor fungsi untuk digunakan di routes
