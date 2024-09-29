const mongoose = require('mongoose');

const BhaktSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['bhakt', 'admin'], default: 'bhakt' },
  name: { type: String, required: true, trim: true },
  phone: {
    type: [String],  // Define an array of strings
    required: true,
    unique: true,
    trim: true,
    validate: {
      validator: function (v) {
        return v.every(phone => /^[6-9]\d{9}$/.test(phone));
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
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
  aadhar: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    match: /^\d{12}$/, // 12-digit Aadhar number
  },
  puja_done: { type: [String], default: [] },
  donations_made: {
    money: { type: Number, default: 0 },
    other: [{
      itemName: { type: String, required: true },
      date: { type: Date, default: Date.now },
      receiptNumber: { type: String, required: true }, // should be generated automatically
      itemDescription: { type: String }
    }]
  },
  last_visit: { type: Date, required: true, default: Date.now },
  occupation: { type: String, required: true },
  email: {
    type: [String],  // Define an array of strings
    required: true,
    validate: [
      {
        validator: function (v) {
          // Ensure that the array contains at most 2 emails
          return v.length <= 2;
        },
        message: 'You can only have a maximum of 2 emails.'
      },
      {
        validator: function (v) {
          // Ensure each email in the array matches the pattern
          return v.every(email => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/.test(email));
        },
        message: props => `${props.value} is not a valid email!`
      }
    ]
  },
  active: { type: Boolean, required: true, default: true },
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
