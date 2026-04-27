const Contact = require('../models/Contact');
const Account = require('../models/Account');
const Deal = require('../models/Deal');
const Task = require('../models/Task');
const Meeting = require('../models/Meeting');
const Call = require('../models/Call');
const Campaign = require('../models/Campaign');
const Document = require('../models/Document');
const Visit = require('../models/Visit');
const Project = require('../models/Project');

const models = {
  contacts: Contact,
  accounts: Account,
  deals: Deal,
  tasks: Task,
  meetings: Meeting,
  calls: Call,
  campaigns: Campaign,
  documents: Document,
  visits: Visit,
  projects: Project
};

exports.getAll = async (req, res) => {
  try {
    const moduleName = req.params.module;
    const Model = models[moduleName];
    if (!Model) return res.status(404).json({ message: 'Module not found' });
    const data = await Model.find().sort({ createdAt: -1 });
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.create = async (req, res) => {
  try {
    const moduleName = req.params.module;
    const Model = models[moduleName];
    if (!Model) return res.status(404).json({ message: 'Module not found' });
    const newRecord = new Model(req.body);
    const savedRecord = await newRecord.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.update = async (req, res) => {
  try {
    const { module: moduleName, id } = req.params;
    const Model = models[moduleName];
    if (!Model) return res.status(404).json({ message: 'Module not found' });
    
    const updatedRecord = await Model.findByIdAndUpdate(id, req.body, { new: true });
    if (!updatedRecord) return res.status(404).json({ message: 'Record not found' });
    
    res.json(updatedRecord);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

exports.remove = async (req, res) => {
  try {
    const { module: moduleName, id } = req.params;
    const Model = models[moduleName];
    if (!Model) return res.status(404).json({ message: 'Module not found' });
    
    const deletedRecord = await Model.findByIdAndDelete(id);
    if (!deletedRecord) return res.status(404).json({ message: 'Record not found' });
    
    res.json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};
