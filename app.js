// app.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

// Import Routes
const itemsRouter = require("./routes/items");
const requestsRouter = require("./routes/requests");
const usersRouter = require("./routes/users");
const transactionsRouter = require("./routes/transactions");
const bookmarksRouter = require("./routes/bookmarks");
const barangDaerahRouter = require("./routes/barang_daerah");
const barangGudangRouter = require("./routes/barang_gudang");
const requestsGudangRouter = require("./routes/requests_gudang");
const statisticsRouter = require("./routes/statistics");
const userNotification = require("./routes/user_notification");

// Use Routes
app.use("/api/items", itemsRouter);
app.use("/api/requests", requestsRouter);
app.use("/api/users", usersRouter);
app.use("/api/transactions", transactionsRouter);
app.use("/api/bookmarks", bookmarksRouter);
app.use("/api/barang_daerah", barangDaerahRouter);
app.use("/api/barang_gudang", barangGudangRouter);
app.use("/api/requests_gudang", requestsGudangRouter);
app.use("/api/statistics", statisticsRouter);
app.use("/api/user_notification", userNotification);

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
