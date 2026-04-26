// --- MODEL (MVC) ---
// This file acts as the 'Model' in the MVC architecture.
// It defines the data structure and schema for complaints in the database.
const mongoose = require('mongoose');

const ComplaintSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  shop: { type: String, required: true },
  product: { type: String, required: true },
  machineId: { type: String, required: true },
  problem: { type: String, required: true },
  severity: { type: String, required: true },
  address: { type: String, required: true },
  status: { type: String, default: 'Pending' },
  ticketId: { type: String, required: true, unique: true },
  remarks: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Complaint', ComplaintSchema);
