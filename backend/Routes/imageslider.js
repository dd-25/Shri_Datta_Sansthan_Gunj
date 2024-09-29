const express = require('express');
const { getContent, uploadContent, deleteContent, editContent } = require('../Controllers/imagesliderController');
const router = express.Router();

router.get('/', getContent);
router.post('/', uploadContent);
router.delete('/', deleteContent);
router.put('/', editContent);

module.exports = router;