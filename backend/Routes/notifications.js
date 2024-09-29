const express = require('express');
const router = express.Router();
const { getAllNotifications, getNotifications, postNotifications, deleteNotifications, editNotifications } = require('../Controllers/notificationsController');

router.get('/all', getAllNotifications);
router.get('/', getNotifications);
router.post('/', postNotifications);
router.delete('/', deleteNotifications);
router.put('/', editNotifications);

module.exports = router;