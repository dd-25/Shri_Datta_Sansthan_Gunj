const mongoose = require('mongoose');

const NiwasSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  numbers: { type: [Number], unique: true, default: [] },
  description: { type: String, required: true, default: "" }
});

module.exports = mongoose.model('Niwas', NiwasSchema);