const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const fs = require("fs");
require("dotenv").config();
const DBConnect = require("./config/db");
const Order = require("./models/orderSchema"); // Ensure correct path
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// ✅ Connect to Database
DBConnect().catch((err) => {
  console.error("Database connection failed:", err);
  process.exit(1); // Stop the server if DB fails
});

// ✅ Middleware
app.use(express.json()); // Replaces bodyParser.json()
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ✅ Define Port
const port = process.env.PORT || 5000;

// ✅ Home Route
app.get("/", (req, res) => {
  res.send("Home Page");
});

// ✅ Serve Static Files (Ensure Public Directory Exists)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Import & Use Routes
app.use("/", require("./routes/userRoute"));
app.use("/admin", require("./routes/adminRoute"));
app.use("/category", require("./routes/categoryRoute"));
app.use("/product", require("./routes/productRoute"));
app.use("/cart", require("./routes/cartRoute"));
app.use("/wishlist", require("./routes/wishlistRoute"));
app.use("/", require("./routes/messageRoute"));
app.use("/checkout", require("./routes/checkoutRoute"));
app.use("/complete", require("./routes/CompleteOrderRoute"));

app.post("/success/:tran_id", async (req, res) => {
  const { tran_id } = req.params;

  try {
    const order = await Order.findOne({ tranjectionId: tran_id });

    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const updateResult = await Order.updateOne(
      { tranjectionId: tran_id },
      { $set: { paidStatus: true } }
    );

    if (updateResult.modifiedCount > 0) {
      const successPagePath = path.join(
        __dirname,
        "public",
        "payment-success.html"
      );

      if (!fs.existsSync(successPagePath)) {
        return res.status(500).json({ message: "Success page missing" });
      }

      fs.readFile(successPagePath, "utf-8", (err, data) => {
        if (err) {
          return res
            .status(500)
            .json({ message: "Error reading success page" });
        }
        res.send(data);
      });
    } else {
      return res.status(400).json({ message: "Failed to update order status" });
    }
  } catch (error) {
    console.error("Error updating order:", error);
    return res.status(500).json({ message: "Internal server error", error });
  }
});

app.post("/fail", (req, res) => {
  console.log("Payment failed.");
  res.status(400).json({ message: "Payment failed" });
});

app.use((err, req, res, next) => {
  console.error("Unhandled Error:", err);
  res.status(500).json({ message: "Something went wrong", error: err.message });
});

app.listen(port, () => {
  console.log(` Server Running on port ${port}`);
});
