const Razorpay = require('razorpay');
const crypto = require('crypto');
const Transaction = require('../Models/Transaction');

// Initialize Razorpay instance
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Function to handle donation logic and complete the transaction upon payment success
async function donate(req, res) {
    const { amount, type, username } = req.body;

    if (!amount || !type || !username) {
        return res.status(400).json({ error: 'Missing required fields: amount, type, or username' });
    }

    try {
        // Step 1: Create an order in Razorpay
        const options = {
            amount: amount * 100, // Razorpay accepts amount in paise (1 INR = 100 paise)
            currency: 'INR',
            receipt: `receipt_${Date.now()}`, // Unique receipt id
            payment_capture: 1 // Auto-capture payment
        };

        const order = await razorpay.orders.create(options);

        // Send order details to the frontend for Razorpay Checkout
        res.json({
            success: true,
            order_id: order.id,  // Razorpay order ID
            key_id: process.env.RAZORPAY_KEY_ID,  // Public key for frontend
            amount: order.amount,
            currency: order.currency
        });
    } catch (error) {
        console.error('Razorpay order creation failed:', error);
        return res.status(500).json({ error: 'Server error during payment initiation' });
    }
}

// Step 2: Handle the payment success verification and transaction creation
async function paymentVerification(req, res) {
    const { razorpay_payment_id, razorpay_order_id, razorpay_signature, username, amount, type } = req.body;

    if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !username || !amount || !type) {
        return res.status(400).json({ error: 'Missing required payment fields' });
    }

    try {
        // Generate the HMAC SHA256 signature to verify Razorpay's response
        const generated_signature = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
            .update(razorpay_order_id + '|' + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            // If payment signature matches, create a new transaction in the database
            const newTransaction = new Transaction({
                transactionId: razorpay_order_id,
                amount: amount * 100, // Store amount in paise
                type: type,
                transactionDate: new Date(),
                username: username,
                status: 'Success', // Mark transaction as successful
                paymentId: razorpay_payment_id
            });

            await newTransaction.save();

            res.json({ success: true, message: 'Payment verified and transaction completed successfully' });
        } else {
            // If the signature does not match, return an error
            return res.status(400).json({ error: 'Payment verification failed' });
        }
    } catch (error) {
        console.error('Payment verification or transaction saving failed:', error);
        return res.status(500).json({ error: 'Server error during payment verification' });
    }
}

module.exports = {
    donate,
    paymentVerification
};