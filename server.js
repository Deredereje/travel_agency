// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

// ===== CORS =====
app.use(cors({
  origin: [
    "https://www.natureplustour.com",
    "https://natureplustour.com"
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===== MongoDB Atlas =====
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB Atlas Connected ✅"))
  .catch(err => console.error("MongoDB connection error ❌", err));

// ===== Schema =====
const formSchema = new mongoose.Schema({
  whereTo: String,
  howMany: String,
  arrivals: String,
  leaving: String,
  name: String,
  email: String,
  phone: String
});

const FormData = mongoose.model("FormData", formSchema);

// ===== Nodemailer (SAFE) =====
let transporter;
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  console.log("Email service ready ✅");
} else {
  console.log("Email service skipped ⚠️ (missing env vars)");
}

// ===== Test route =====
app.get("/", (req, res) => {
  res.send("Backend is running ✅");
});

// ===== Save form =====
app.post("/save", async (req, res) => {
  try {
    console.log("Received data:", req.body);

    // 1️⃣ Save to MongoDB
    const saved = await FormData.create(req.body);
    console.log("Saved to DB ✅", saved._id);

    // 2️⃣ Respond FIRST (important)
    res.status(200).json({ message: "Booking saved successfully" });

    // 3️⃣ Send emails (NON-BLOCKING)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `New Travel Booking from ${req.body.name}`,
          text: `
Where To: ${req.body.whereTo}
How Many: ${req.body.howMany}
Arrivals: ${req.body.arrivals}
Leaving: ${req.body.leaving}
Name: ${req.body.name}
Email: ${req.body.email}
Phone: ${req.body.phone}`
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: req.body.email,
          subject: "Booking Confirmation",
          html: `<h3>Hello ${req.body.name}</h3><p>Your booking is confirmed!</p>`
        });

        console.log("Emails sent ✅");
      } catch (emailErr) {
        console.error("Email error ⚠️", emailErr.message);
      }
    }

  } catch (error) {
    console.error("SAVE ERROR ❌", error);
    res.status(500).json({ message: "Server error" });
  }
});

// ===== Start server =====
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
