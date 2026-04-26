// --- CONTROLLER (MVC) ---
// This file acts as a 'Controller' in the MVC architecture.
// It handles the business logic for the chat feature, taking requests from the route
// and fetching responses from the AI service.

const jwt = require('jsonwebtoken');
const { getChatResponse } = require('../services/geminiService');

const handleChatRequest = async (req, res) => {
  try {
    const { messages, language, context } = req.body;
    
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    let isAdmin = false;
    const token = req.headers.authorization?.split(' ')[1];
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        if (decoded && decoded.username === process.env.ADMIN_USERNAME) {
          isAdmin = true;
        }
      } catch (err) {
        console.warn("Invalid token for chat request");
      }
    }

    const reply = await getChatResponse(messages, isAdmin, language);
    
    // Attempt to extract suggested action if applicable (e.g., if we asked Claude to output JSON or specific commands). For now, returning null as requested by the example.
    res.json({
      reply,
      suggestedAction: null
    });
  } catch (error) {
    console.error("Chat Route Error:", error);

    if (error.status === 429 || (error.message && error.message.includes('429'))) {
      return res.status(429).json({ error: "The AI assistant is receiving too many requests right now. Please try again in 10-20 seconds." });
    }

    res.status(500).json({ error: error.message || "Failed to generate chat response." });
  }
};

module.exports = {
  handleChatRequest
};
