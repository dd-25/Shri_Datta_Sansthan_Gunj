require('dotenv').config();
const Puja = require('../Models/Puja');
const PujaBooking = require('../Models/Pujabooking');
const Transaction = require('../Models/Transaction');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { addDays, startOfDay } = require('date-fns');

// Function to generate a checksum for PhonePe request
// function generateChecksum(data, saltKey) {
//     return crypto.createHmac('sha256', saltKey).update(data).digest('hex');
// }

// Fetch all pujas
async function getPuja(req, res) {
    try {
        const puja = await Puja.find({}).exec();
        return res.status(200).json({ success: true, puja });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Cannot fetch Pujas' });
    }
}

// Get available slots for a specific puja
async function getpujaSlot(req, res) {
    const { pujaType } = req.query;
    if (!pujaType) {
        return res.status(400).json({ error: 'Puja type is required' });
    }
    try {
        const puja = await Puja.findOne({ name: pujaType });
        if (!puja) {
            return res.status(404).json({ error: 'Puja type not found' });
        }

        const limit = puja.limit;
        let validDates = [];

        for (let i = 0; i < 15; i++) {
            const date = startOfDay(addDays(new Date(), i));
            const formattedDate = date.toISOString().split('T')[0];
            const booking = await PujaBooking.findOne({ date: formattedDate });

            if (!booking) {
                validDates.push(formattedDate);
            } else {
                const pujaInBooking = booking.list.find(puja => puja.name === pujaType);
                if (!pujaInBooking || pujaInBooking.hosts.length < limit) {
                    validDates.push(formattedDate);
                }
            }
        }

        res.status(200).json({ success: true, validDates, message: "Available slots fetched successfully" });
    } catch (error) {
        console.error('Error fetching available slots:', error);
        res.status(500).json({ error: 'Error fetching available slots' });
    }
}

// Step 1: Initiate Payment
async function initiatePayment(req, res) {
    const { pujaType, date, username } = req.body;

    if (!pujaType || !date || !username) {
        return res.status(400).json({ error: 'Puja type, date, and username are required' });
    }

    try {
        // Fetch the Puja type to calculate the price
        const puja = await Puja.findOne({ name: pujaType });
        if (!puja) {
            return res.status(404).json({ error: 'Puja type not found' });
        }

        // Step 1: Initiate Payment via Razorpay
        const razorpay = new Razorpay({
            key_id: process.env.RAZORPAY_KEY_ID,
            key_secret: process.env.RAZORPAY_KEY_SECRET,
        });

        const options = {
            amount: puja.price * 100, // amount in the smallest currency unit (paise for INR)
            currency: 'INR',
            receipt: `receipt_order_${Date.now()}`,
        };

        const order = await razorpay.orders.create(options);

        return res.status(200).json({
            success: true,
            order_id: order.id,
            amount: order.amount,
            currency: order.currency,
            key_id: process.env.RAZORPAY_KEY_ID, // Razorpay public key
        });
    } catch (error) {
        console.error('Error initiating payment:', error);
        return res.status(500).json({ error: 'Server error during payment initiation' });
    }
}

// Step 2: Verify Payment and Confirm Booking
async function verifyPayment(req, res) {
    const { pujaType, date, username, razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

    if (!pujaType || !date || !username || !razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Verify payment signature
        const body = razorpay_order_id + '|' + razorpay_payment_id;
        const expectedSignature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(body.toString())
            .digest('hex');

        if (expectedSignature !== razorpay_signature) {
            return res.status(400).json({ error: 'Payment verification failed. Please try again.' });
        }

        // Proceed to booking after successful payment verification
        const puja = await Puja.findOne({ name: pujaType });
        if (!puja) {
            return res.status(404).json({ error: 'Puja type not found' });
        }

        const limit = puja.limit;
        let pujaBooking = await PujaBooking.findOne({ date });

        if (!pujaBooking) {
            pujaBooking = new PujaBooking({ date, list: [] });
        }

        const pujaInBooking = pujaBooking.list.find(puja => puja.name === pujaType);

        if (pujaInBooking) {
            if (pujaInBooking.hosts.length >= limit) {
                return res.status(400).json({ error: 'No slots available for the selected date and puja type' });
            }
            pujaInBooking.hosts.push(username);
        } else {
            pujaBooking.list.push({
                name: pujaType,
                hosts: [username],
            });
        }

        await pujaBooking.save();

        // Save the transaction details in the Transaction model
        const newTransaction = new Transaction({
            transactionId: razorpay_payment_id,
            amount: puja.price * 100, // Save the amount in paise
            type: 'PUJA',
            transactionDate: new Date(),
            username: username,
        });

        await newTransaction.save();

        return res.status(200).json({ success: true, message: 'Booking confirmed successfully' });
    } catch (error) {
        console.error('Error verifying payment or confirming booking:', error);
        return res.status(500).json({ error: 'Server error during payment verification or booking' });
    }
}

module.exports = {
    getPuja,
    getpujaSlot,
    initiatePayment,
    verifyPayment,
};
