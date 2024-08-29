const express = require('express');
const router = express.Router();
const {validateLogin} = require('../Controllers/loginController');

router.post('/', validateLogin); // some controller function

module.exports = router;