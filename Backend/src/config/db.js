// const mongoose = require("mongoose");
// const logger = require('../utils/Logger');

// async function connectdb() {
//   try {
//     await mongoose.connect(process.env.MONGO_URI);
//     logger.info("MongoDB connected successfully");
//   } catch (error) {
//     logger.error("Error connecting to MongoDB:", error);
//     process.exit(1);
//   }
// }

// module.exports = connectdb;

const mongoose = require("mongoose");

let isConnected = false;

async function connectdb() {
  if (isConnected) return;

  try {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
    console.log("MongoDB connected");
  } catch (err) {
    console.error("DB error:", err.message);
    throw new Error("DB connection failed");
  }
}

module.exports = connectdb;