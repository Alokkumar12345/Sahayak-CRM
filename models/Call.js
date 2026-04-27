const mongoose = require('mongoose');

const CallSchema = new mongoose.Schema({
  caller: { type: String, required: true },
  receiver: { type: String, required: true },
  duration: { type: Number }, // in minutes or seconds
  date: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Call', CallSchema);
