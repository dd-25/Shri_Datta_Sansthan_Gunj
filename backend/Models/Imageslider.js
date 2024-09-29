const mongoose = require('mongoose');

const ImagesliderSchema = new mongoose.Schema({
  image: { type: String, required: true, unique: true },
  description: { type: String, required: true }
});

module.exports = mongoose.model('Imageslider', ImagesliderSchema);
