const express = require('express');
const { getContent, uploadContent, deleteContent } = require('../Controllers/contentController');
const router = express.Router();

router.get('/', getContent);
router.post('/', uploadContent);
router.delete('/', deleteContent);

module.exports = router;