// config.js
const mysql = require("mysql2");

const pool = mysql.createPool({
  host: "localhost",
  user: "root", // ganti dengan username MySQL Anda
  password: "", // ganti dengan password MySQL Anda
  database: "inventory_management",
});

module.exports = pool.promise();
