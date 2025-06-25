// models/Manuscript.js
const mongoose = require('mongoose');

const manuscriptSchema = new mongoose.Schema({
  name: String,
  email: String,
  title: String,
  abstract: String,
  filePath: String,
  uploadedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Manuscript', manuscriptSchema);
