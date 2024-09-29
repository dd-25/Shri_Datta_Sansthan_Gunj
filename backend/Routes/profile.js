const express = require('express');
const router = express.Router();
const { editProfile, changePassword, checkPassword } = require('../Controllers/profileController');

router.put('/', editProfile);
router.post('/', changePassword);
router.post('/check', checkPassword);

module.exports = router;