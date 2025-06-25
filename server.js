
// server.js
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const PORT = process.env.PORT || 5000;

// Connect MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Create uploads folder if it doesn't exist
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Routes
const submitRoute = require('./routes/submit');
app.use('/api/submit', submitRoute);

const Manuscript = require('./models/Manuscript');

// Get all submissions
app.get('/api/manuscripts', async (req, res) => {
  try {
    const manuscripts = await Manuscript.find();
    res.json(manuscripts);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch manuscripts' });
  }
});

// Get a single manuscript
app.get('/api/manuscripts/:id', async (req, res) => {
  try {
    const manuscript = await Manuscript.findById(req.params.id);
    if (!manuscript) return res.status(404).json({ error: 'Not found' });
    res.json(manuscript);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch manuscript' });
  }
});

// Update a manuscript
app.put('/api/manuscripts/:id', async (req, res) => {
  try {
    const updated = await Manuscript.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ error: 'Not found' });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update manuscript' });
  }
});

// Delete a manuscript
app.delete('/api/manuscripts/:id', async (req, res) => {
  try {
    const deleted = await Manuscript.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete manuscript' });
  }
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
