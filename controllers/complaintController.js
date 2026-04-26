const Complaint = require('../models/Complaint');

exports.createComplaint = async (req, res) => {
  try {
    const { name, phone, shop, product, machineId, problem, severity, address } = req.body;
    
    // Generate simple ticket ID
    const dateStr = new Date().toISOString().split('T')[0].replace(/-/g, '');
    const randomNum = Math.floor(100 + Math.random() * 900);
    const ticketId = `TKT-${dateStr}-${randomNum}`;
    
    const newComplaint = new Complaint({ name, phone, shop, product, machineId, problem, severity, address, ticketId });
    await newComplaint.save();
    res.status(201).json({ message: 'Complaint filed successfully', ticketId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create complaint' });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const filters = {};
    if (req.query.shop) filters.shop = req.query.shop;
    if (req.query.status) filters.status = req.query.status;
    const complaints = await Complaint.find(filters).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch complaints' });
  }
};

exports.updateComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;
    
    const updateData = {};
    if (status) updateData.status = status;
    if (remarks !== undefined) updateData.remarks = remarks;

    const updated = await Complaint.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update complaint' });
  }
};

exports.getUserComplaints = async (req, res) => {
  try {
    const { phone } = req.params;
    if (!phone) return res.status(400).json({ error: 'Phone number is required' });
    
    const complaints = await Complaint.find({ phone }).sort({ createdAt: -1 });
    res.json(complaints);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch user complaints' });
  }
};
