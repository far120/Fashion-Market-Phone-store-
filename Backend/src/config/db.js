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
const logger = require('../utils/Logger');

let isConnected = false;

async function connectdb() {
  if (isConnected) {
    return;
  }

  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    isConnected = db.connections[0].readyState === 1;

    logger.info("MongoDB connected successfully");
  } catch (error) {
    logger.error("Error connecting to MongoDB:", error);
    throw error; // ❗ مهم بدل process.exit
  }
}

module.exports = connectdb;