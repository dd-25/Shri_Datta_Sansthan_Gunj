const mongoose = require('mongoose');

const BhaktSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['bhakt', 'admin'], default: 'bhakt' },
  name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, unique: true, trim: true },
  dob: { type: Date, required: true },
  gender: { type: String, required: true, enum: ['male', 'female', 'other'] },
  address: {
    street: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: Number, required: true, min: 100000, max: 999999 },
    country: { type: String, required: true, trim: true }
  },
  bhaktSince: { type: Date, required: true, default: Date.now },
  aadhar: { type: String, required: true, unique: true, trim: true },
  puja_done: { type: [String], default: [] },
  donations_made: {
    money: { type: Number, default: 0 },
    food: [{
      item: { type: String },
      date: { type: Date, default: Date.now }
    }],
    accessories: [{
      item: { type: String },
      date: { type: Date, default: Date.now }
    }]
  },
  last_visit: { type: Date, required: true, default: Date.now },
  occupation: { type: String, required: true},
  email: { type: String, required: true, unique: true, trim: true },
  active: {
    type: Boolean,
    required: true,
    default: true
  }
});

// Indexes for better query performance
BhaktSchema.index({ name: 1 });
BhaktSchema.index({ occupation: 1 });
BhaktSchema.index({ 'address.city': 1 });
BhaktSchema.index({ 'address.state': 1 });
BhaktSchema.index({ 'address.country': 1 });

// Automatically deactivate bhakt after 10 years of inactivity
BhaktSchema.pre('save', function (next) {
  const tenYearsAgo = new Date();
  tenYearsAgo.setFullYear(tenYearsAgo.getFullYear() - 10);

  if (this.last_visit < tenYearsAgo) {
    this.active = false;
  }

  next();
});

module.exports = mongoose.model('Bhakt', BhaktSchema);
