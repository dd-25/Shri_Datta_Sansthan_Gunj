const mongoose = require('mongoose');

const NiwasBookingSchema = new mongoose.Schema({
    date: { type: String, required: true, unique: true },
    list: [{
        type: { type: String, required: true },
        numbers: [{ name: { type: String, required: true }, number: { type: Number, required: true }}]
    }]
}, { timestamps: true })

module.exports = mongoose.model('NiwasBooking', NiwasBookingSchema);