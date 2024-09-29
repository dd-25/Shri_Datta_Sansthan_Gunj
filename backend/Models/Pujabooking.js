const mongoose = require('mongoose');

const PujaBookingSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    list: [{
        name: { type: String, required: true },
        hosts: { type: [String], required: true, default: [] }
    }]
}, { timestamps: true })

module.exports = mongoose.model('PujaBooking', PujaBookingSchema);