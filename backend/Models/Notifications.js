const mongoose = require('mongoose');

const NotificationsSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  list: { type: [String], default: [] }
});

module.exports = mongoose.model('Notifications', NotificationsSchema);