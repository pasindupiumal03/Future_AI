const mongoose = require('mongoose');

const VideoRequestSchema = new mongoose.Schema({
  prompt: { type: String, required: true },
  imageFilename: { type: String },
  videoUrl: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('VideoRequest', VideoRequestSchema); 