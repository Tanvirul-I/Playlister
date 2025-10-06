const mongoose = require("mongoose");
require("../utils/configure-env");

mongoose.set("useFindAndModify", false);

mongoose
  .connect(process.env.DB_CONNECT, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB Atlas"))
  .catch((e) => console.error("❌ Connection error", e.message));

const db = mongoose.connection;

module.exports = db;
