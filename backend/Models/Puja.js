const mongoose = require('mongoose');

const PujaSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  limit: { type:Number, required: true },
  description: { type: String, required: true, default: "" }
});

module.exports = mongoose.model('Puja', PujaSchema);