const express = require('express');
const router = express.Router();
const {showBhakts} = require('../Controllers/searchBhaktController');

router.post('/', showBhakts);

module.exports = router;