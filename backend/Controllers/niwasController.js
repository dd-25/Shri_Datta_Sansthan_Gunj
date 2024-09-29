const mongoose = require('mongoose');
const Niwas = require('../Models/Niwas');
const NiwasBooking = require('../Models/Niwasbooking');
const Transaction = require('../Models/Transaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { addDays, startOfDay } = require('date-fns');

// Razorpay instance (ensure keys are securely stored in environment variables)
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Helper function to generate a checksum (HMAC SHA256)
function generateChecksum(data, saltKey) {
    return crypto.createHmac('sha256', saltKey).update(data).digest('hex');
}

async function getNiwas(req, res) {
    try {
        const niwas = await Niwas.find({}).exec();
        return res.status(200).json({ success: true, niwas });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Cannot fetch niwas' });
    }
}
// Get available rooms for a specific Niwas type and date
async function getNiwasSlot(req, res) {
    const { niwasType } = req.query;
    if (!niwasType) {
        return res.status(400).json({ error: 'Niwas type is required' });
    }

    try {
        const niwas = await Niwas.findOne({ name: niwasType });
        if (!niwas) {
            return res.status(404).json({ error: 'Niwas type not found' });
        }

        let validDates = [];
        for (let i = 0; i < 15; i++) {
            const date = startOfDay(addDays(new Date(), i));
            const formattedDate = date.toISOString().split('T')[0];

            const booking = await NiwasBooking.findOne({ date: formattedDate });

            if (!booking || booking.list.some(niwasBooking => niwasBooking.type === niwasType && niwasBooking.numbers.length < niwas.numbers.length)) {
                validDates.push(formattedDate);
            }
        }

        res.status(200).json({ success: true, validDates, message: 'Available dates fetched successfully' });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Error fetching available slots' });
    }
}

// Step 1: Initiate payment
async function initiatePayment(req, res) {
    const { niwasType, date, username } = req.body;

    if (!niwasType || !date || !username) {
        return res.status(400).json({ error: 'Niwas type, date, and username are required' });
    }

    try {
        // Fetch the Niwas type to calculate the price
        const niwas = await Niwas.findOne({ name: niwasType });
        if (!niwas) {
            return res.status(404).json({ error: 'Niwas type not found' });
        }

        // Initiate Razorpay payment
        const amount = niwas.price * 100; // Convert amount to paise (assuming niwas.price is in INR)
        const paymentOptions = {
            amount: amount,
            currency: 'INR',
            receipt: `receipt_order_${username}_${Date.now()}`,
        };

        const order = await razorpay.orders.create(paymentOptions);

        // Return the payment order ID to the frontend
        return res.status(200).json({
            success: true,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            message: 'Payment initiated, complete payment to confirm booking',
        });
    } catch (error) {
        console.error('Error initiating payment:', error);
        return res.status(500).json({ error: 'Server error during payment initiation' });
    }
}

// Step 2: Verify payment and confirm booking
async function verifyPayment(req, res) {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, niwasType, date, username, type } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature || !niwasType || !date || !username) {
        return res.status(400).json({ error: 'All payment and booking details are required' });
    }

    try {
        // Verify the payment signature
        const generatedSignature = generateChecksum(
            razorpay_order_id + '|' + razorpay_payment_id,
            process.env.RAZORPAY_KEY_SECRET
        );

        if (generatedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed' });
        }

        // Payment successful, proceed to book the Niwas
        const niwas = await Niwas.findOne({ name: niwasType });
        if (!niwas) {
            return res.status(404).json({ error: 'Niwas type not found' });
        }

        let booking = await NiwasBooking.findOne({ date });
        if (!booking) {
            booking = new NiwasBooking({ date, list: [] });
        }

        let niwasBooking = booking.list.find(niwas => niwas.type === niwasType);
        let availableRoom = null;

        if (niwasBooking) {
            const bookedRooms = niwasBooking.numbers.map(room => room.number);
            availableRoom = niwas.numbers.find(room => !bookedRooms.includes(room));

            if (!availableRoom) {
                return res.status(400).json({ error: 'No available rooms for the selected Niwas type and date' });
            }

            niwasBooking.numbers.push({ name: username, number: availableRoom });
        } else {
            availableRoom = niwas.numbers[0];
            booking.list.push({
                type: niwasType,
                numbers: [{ name: username, number: availableRoom }],
            });
        }

        // Save the transaction
        const transaction = new Transaction({
            transactionId: razorpay_order_id,
            amount: niwas.price * 100, // Store amount in paise
            type: type,
            transactionDate: new Date(),
            username: username,
            status: 'Success', // Mark transaction as successful
            paymentId: razorpay_payment_id
        });

        await transaction.save();

        // Save the booking only after successful payment verification
        await booking.save();

        return res.status(200).json({ success: true, message: 'Payment verified, booking confirmed', booking });
    } catch (error) {
        console.error('Error verifying payment or booking:', error);
        return res.status(500).json({ error: 'Server error during payment verification or booking' });
    }
}

module.exports = {
    getNiwas,
    getNiwasSlot,
    initiatePayment,
    verifyPayment,
};
