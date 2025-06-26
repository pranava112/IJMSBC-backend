
// routes/submit.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Manuscript = require('../models/Manuscript');

// Storage engine
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename: (req, file, cb) =>
    cb(null, Date.now() + '-' + file.originalname)
});

const upload = multer({ storage });

// POST route
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { name, email, title, abstract } = req.body;
    const filePath = req.file.path;

    const manuscript = new Manuscript({ name, email, title, abstract, filePath });
    await manuscript.save();

    res.status(201).json({ message: 'Manuscript submitted successfully!' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Submission failed' });
  }
});

module.exports = router;


