


require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("MongoDB connected"))
.catch((err) => console.error("MongoDB connection error:", err));

// Models
const User = require('./models/User');
const Manuscript = require('./models/Manuscript');

// Create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const upload = multer({ storage });

// JWT authentication middleware
// const authenticate = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(401).json({ error: 'Token required' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// };

const authenticate = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token required' });
  }

  const token = authHeader.split(' ')[1]; // Extract the actual token

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // attach decoded user info if needed
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};


// === Auth Routes ===
app.post('/api/register', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ error: 'User already exists' });

    const hash = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hash });
    res.status(201).json({ message: 'Registered successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Registration failed' });
  }
});

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

  try {
    const user = await User.findOne({ email });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );
    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// === Manuscript Routes ===
app.post('/api/submit', authenticate, upload.single('file'), async (req, res) => {
  try {
    const { name, email, title, abstract } = req.body;
    const filePath = req.file ? req.file.path : '';

    const manuscript = new Manuscript({ name, email, title, abstract, filePath });
    await manuscript.save();
    res.status(201).json({ message: 'Submission successful' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Submission failed' });
  }
});

app.get('/api/manuscripts', authenticate, async (req, res) => {
  try {
    const manuscripts = await Manuscript.find();
    res.json(manuscripts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch manuscripts' });
  }
});

app.delete('/api/manuscripts/:id', authenticate, async (req, res) => {
  try {
    const manuscript = await Manuscript.findByIdAndDelete(req.params.id);
    if (!manuscript) return res.status(404).json({ error: 'Manuscript not found' });

    if (manuscript.filePath && fs.existsSync(manuscript.filePath)) {
      fs.unlinkSync(manuscript.filePath);
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete manuscript' });
  }
});

// === Start Server ===
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));




// import Contact from './models/Contact.js';
// import Manuscript from './models/Manuscript.js';
// import User from './models/User.js';
// import bcrypt from 'bcryptjs';
// import cors from 'cors';
// import dotenv from 'dotenv';
// import express from 'express';
// import { fileURLToPath } from 'url';
// import fs from 'fs';
// import jwt from 'jsonwebtoken';
// import mongoose from 'mongoose';
// import multer from 'multer';
// import path from 'path';

// // Models




// dotenv.config();
// const app = express();
// const PORT = process.env.PORT || 5000;

// // Handle __dirname in ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// // MongoDB connection
// mongoose.connect(process.env.MONGO_URI, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true
// })
// .then(() => console.log("MongoDB connected"))
// .catch((err) => console.error("MongoDB connection error:", err));

// // Create uploads folder if it doesn't exist
// if (!fs.existsSync('./uploads')) {
//   fs.mkdirSync('./uploads');
// }

// // Multer setup
// const storage = multer.diskStorage({
//   destination: (req, file, cb) => cb(null, 'uploads/'),
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
// });
// const upload = multer({ storage });

// // JWT middleware
// const authenticate = (req, res, next) => {
//   const token = req.headers['authorization'];
//   if (!token) return res.status(401).json({ error: 'Token required' });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     req.user = decoded;
//     next();
//   } catch (err) {
//     return res.status(401).json({ error: 'Invalid token' });
//   }
// };

// //
// // ==== Contact Form Route ====
// //
// app.post('/api/contact', async (req, res) => {
//   const { name, email, phone, address, message } = req.body;
//   if (!name || !email || !phone || !address || !message) {
//     return res.status(400).json({ error: 'All fields are required.' });
//   }

//   try {
//     const newContact = new Contact({ name, email, phone, address, message });
//     await newContact.save();
//     res.status(201).json({ message: 'Contact submitted successfully!' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Server error' });
//   }
// });

// //
// // ==== Auth Routes ====
// //
// app.post('/api/register', async (req, res) => {
//   const { name, email, password } = req.body;
//   if (!name || !email || !password) return res.status(400).json({ error: 'All fields are required' });

//   try {
//     const existing = await User.findOne({ email });
//     if (existing) return res.status(400).json({ error: 'User already exists' });

//     const hash = await bcrypt.hash(password, 10);
//     await User.create({ name, email, password: hash });
//     res.status(201).json({ message: 'Registered successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Registration failed' });
//   }
// });

// app.post('/api/login', async (req, res) => {
//   const { email, password } = req.body;
//   if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

//   try {
//     const user = await User.findOne({ email });
//     if (!user || !(await bcrypt.compare(password, user.password))) {
//       return res.status(401).json({ error: 'Invalid credentials' });
//     }

//     const token = jwt.sign(
//       { id: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '2h' }
//     );
//     res.json({ token });
//   } catch (err) {
//     res.status(500).json({ error: 'Login failed' });
//   }
// });

// //
// // ==== Manuscript Routes ====
// //
// app.post('/api/submit', authenticate, upload.single('file'), async (req, res) => {
//   try {
//     const { name, email, title, abstract } = req.body;
//     const filePath = req.file ? req.file.path : '';

//     const manuscript = new Manuscript({ name, email, title, abstract, filePath });
//     await manuscript.save();
//     res.status(201).json({ message: 'Submission successful' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ error: 'Submission failed' });
//   }
// });

// app.get('/api/manuscripts', authenticate, async (req, res) => {
//   try {
//     const manuscripts = await Manuscript.find();
//     res.json(manuscripts);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch manuscripts' });
//   }
// });

// app.delete('/api/manuscripts/:id', authenticate, async (req, res) => {
//   try {
//     const manuscript = await Manuscript.findByIdAndDelete(req.params.id);
//     if (!manuscript) return res.status(404).json({ error: 'Manuscript not found' });

//     if (manuscript.filePath && fs.existsSync(manuscript.filePath)) {
//       fs.unlinkSync(manuscript.filePath);
//     }

//     res.json({ message: 'Deleted successfully' });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to delete manuscript' });
//   }
// });

// //
// // ==== Start Server ====
// app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
