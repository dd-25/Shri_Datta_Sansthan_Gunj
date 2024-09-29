const express = require('express');
const router = express.Router();
const { getPuja, getpujaSlot, initiatePayment, verifyPayment } = require('../Controllers/pujaslotController');

router.get('/puja', getPuja);
router.get('/', getpujaSlot);
router.post('/', initiatePayment);
router.post('/verify', verifyPayment);

module.exports = router;