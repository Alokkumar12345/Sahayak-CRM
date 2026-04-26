// --- ROUTE (Part of Controller layer in MVC) ---
// This file acts as a router mapping URL endpoints to the appropriate Controller logic.

const express = require('express');
const { handleChatRequest } = require('../controllers/chatController');

const router = express.Router();

router.post('/', handleChatRequest);

module.exports = router;
