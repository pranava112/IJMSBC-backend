// // models/Manuscript.js
// const mongoose = require('mongoose');

// const manuscriptSchema = new mongoose.Schema({
//   name: String,
//   email: String,
//   title: String,
//   abstract: String,
//   filePath: String,
//   uploadedAt: {
//     type: Date,
//     default: Date.now
//   }
// });

// module.exports = mongoose.model('Manuscript', manuscriptSchema);


// models/Manuscript.js
const mongoose = require('mongoose');

const ManuscriptSchema = new mongoose.Schema({
  name: String,
  email: String,
  title: String,
  abstract: String,
  filePath: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Manuscript', ManuscriptSchema);
