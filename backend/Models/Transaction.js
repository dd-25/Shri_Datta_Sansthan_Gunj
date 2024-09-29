const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
    transactionId: { type: String, required: true, unique: true },
    amount: { type: Number, required: true },
    type: { type: String, required: true },
    transactionDate: { type: Date, required: true },
    username: { type: String, required: true },
    description: { type: String, required: true, default: "donation" }
});

module.exports = mongoose.model('Transaction', TransactionSchema);