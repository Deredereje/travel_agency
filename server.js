// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ===== Middleware =====
app.use(cors({
  origin: "*", // For testing, allow all frontends. Replace with your frontend URL for production
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MongoDB Atlas Connection =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.error("MongoDB connection error ❌", err));

// ===== Schema + Model =====
const formSchema = new mongoose.Schema({
  whereTo: String,
  howMany: String,
  arrivals: String,
  leaving: String,
  name: String,
  email: String,
  phone: String,
  finaldestination: String
});

const FormData = mongoose.model("FormData", formSchema);

// ===== Nodemailer setup =====
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER, // Gmail account
    pass: process.env.EMAIL_PASS  // Gmail App Password
  }
});

// ===== Test route =====
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ===== Save form and send email =====
app.post("/save", async (req, res) => {
  const { whereTo, howMany, arrivals, leaving, name, email, phone } = req.body;
  console.log("Received data:", req.body);

  try {
    // Save to MongoDB
    await FormData.create({ whereTo, howMany, arrivals, leaving, name, email, phone });

    // Send email to admin
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `New Travel Booking from ${name}`,
      text: `
Where To: ${whereTo}
How Many: ${howMany}
Arrivals: ${arrivals}
Leaving: ${leaving}
Name: ${name}
Email: ${email}
Phone: ${phone}`
    });

    // Send confirmation to user
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmation",
      html: `<h3>Hello ${name}</h3><p>Your booking is confirmed!</p>`
    });

    console.log("Booking saved & emails sent ✅");
    res.status(200).json({ message: "Your data is saved and email sent!" });

  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Start server on Render port =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
