const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const nodemailer = require('nodemailer');
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection (ONLY ONCE)
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB Atlas Connected ✅"))
.catch(err => console.error("MongoDB connection error ❌", err));

// Schema + Model
const formSchema = new mongoose.Schema({
  whereTo: String,
  howMany: String,
  arrivals: String,
  leaving: String,
  name: String,
  email: String,
  phone: String,
  finaldestination: String,
});

const FormData = mongoose.model("FormData", formSchema);

// Email transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Test route
app.get('/', (req, res) => {
  res.send('Backend is running ✅');
});

app.use(cors({
  origin: "*",
  methods: ["GET", "POST"]
}));


// Save form and send email
app.post('/save', async (req, res) => {
  try {
    const {
      whereTo,
      howMany,
      arrivals,
      leaving,
      name,
      email,
      phone
    } = req.body;

    await FormData.create({
      whereTo,
      howMany,
      arrivals,
      leaving,
      name,
      email,
      phone
    });

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
Phone: ${phone}
      `
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Booking Confirmation",
      html: `<h3>Hello ${name}</h3><p>Your booking is confirmed!</p>`
    });

    res.status(200).json({ message: "Your data is saved and email sent!" });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start server (LAST)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
