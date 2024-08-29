const mongoose = require('mongoose');

const GallerySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  images: { type: [String], default: [] },
  videos: { type: [String], default: [] }
});

module.exports = mongoose.model('Gallery', GallerySchema);
