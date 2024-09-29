const express = require('express');
const router = express.Router();
const { donate, paymentVerification } = require('../Controllers/donationController');

router.post('/', donate);
router.post('/verify', paymentVerification);

module.exports = router;