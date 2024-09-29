const express = require('express');
const router = express.Router();
const { getNiwas, getNiwasSlot, initiatePayment, verifyPayment } = require('../Controllers/niwasController');

router.get('/', getNiwas);
router.get('/niwasType', getNiwasSlot);
router.post('/', initiatePayment);
router.post('/verify', verifyPayment);


module.exports = router;