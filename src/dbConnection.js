const mongoose = require("mongoose");

const dbConnection = async () => {
  try {
    const URL = process.env.MONGO_DB_URL;
    console.log('URL', URL)
    const conn = await mongoose.connect(URL);
    console.log("✅ MongoDB Connected Successfully!");
  } catch (err) {
    console.log("Failed to connect Database");
  }
};

module.exports = dbConnection;
