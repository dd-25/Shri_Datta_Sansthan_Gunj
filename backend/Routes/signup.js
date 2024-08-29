const express = require('express');
const router = express.Router();
const {createBhakt} = require('../Controllers/signupController');
const path = require('path');

router.post('/', createBhakt);

module.exports = router;