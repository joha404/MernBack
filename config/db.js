const mongoose = require("mongoose");

let isConnected = false;

const DBConnect = async () => {
  if (isConnected) {
    console.log("🔄 Using existing database connection");
    return;
  }

  try {
    const connection = await mongoose.connect(process.env.MONGOURL);

    isConnected = connection.connections[0].readyState === 1;
    console.log("✅ MongoDB Connected Successfully");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    process.exit(1); // Exit process if connection fails
  }
};

module.exports = DBConnect;
