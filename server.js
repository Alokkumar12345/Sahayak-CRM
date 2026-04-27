// --- MAIN ENTRY POINT ---
// This file sets up the server, configuring the View paths and Route bindings.
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');

const complaintRoutes = require('./routes/complaintRoutes');
const chatRoutes = require('./routes/chatRoutes');
const authRoutes = require('./routes/authRoutes');
const crmRoutes = require('./routes/crmRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// --- VIEW (MVC) ---
// We serve static assets (css, js) from the 'public' folder.
app.use(express.static(path.join(__dirname, 'public')));

// --- ROUTES (Controller mapped logic) ---
app.use('/api/complaints', complaintRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/crm', crmRoutes);

// --- VIEW (MVC) ---
// HTML views are served from the dedicated 'views' directory.
app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'admin.html'));
});

// Fallback to index.html (the Customer View)
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'views', 'index.html'));
});

// --- MODEL (MVC) Initialization ---

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
  .on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Port ${PORT} is already in use. Please kill the process on this port or change the PORT in .env.`);
      process.exit(1);
    } else {
      console.error("Server startup error:", err);
    }
  });

// Handle crashes gracefully and log them
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
