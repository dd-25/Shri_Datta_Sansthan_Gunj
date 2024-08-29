const express = require('express');
const { getAudio, uploadAudio, deleteAudio, renameAudio } = require('../Controllers/audioController');
const router = express.Router();

router.get('/', getAudio);
router.post('/', uploadAudio);
router.delete('/', deleteAudio);
router.put('/', renameAudio);

module.exports = router;