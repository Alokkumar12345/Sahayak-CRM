const express = require('express');
const { createComplaint, getComplaints, updateComplaint, getUserComplaints } = require('../controllers/complaintController');
const { verifyToken } = require('../controllers/authController');

const router = express.Router();

router.post('/', createComplaint);
router.get('/', verifyToken, getComplaints);
router.get('/user/:phone', verifyToken, getUserComplaints);
router.put('/:id', verifyToken, updateComplaint);

module.exports = router;
