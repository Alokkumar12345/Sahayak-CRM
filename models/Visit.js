const mongoose = require('mongoose');

const VisitSchema = new mongoose.Schema({
  location: { type: String, required: true },
  date: { type: Date, required: true },
  purpose: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Visit', VisitSchema);
