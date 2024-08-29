const mongoose = require('mongoose');

const AudioSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  url: { type:String, required: true, unique: true }
});

module.exports = mongoose.model('Audio', AudioSchema);
