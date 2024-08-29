const express = require('express');
const router = express.Router();
const { verifyToken } = require('../Controllers/verifyTokenController');

router.post('/', verifyToken);

module.exports = router;