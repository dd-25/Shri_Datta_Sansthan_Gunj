const express = require('express');
const { getAllDirectories, createDirectory, renameDirectory, deleteDirectory, getContent } = require('../Controllers/galleryController');
const router = express.Router();

router.get('/', getAllDirectories);
router.get('/content/:directoryName/:type', getContent);
router.post('/', createDirectory);
router.put('/', renameDirectory);
router.delete('/', deleteDirectory);

module.exports = router;