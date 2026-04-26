# MVC Architecture Study Guide

This document explains the Model-View-Controller (MVC) architecture using the Sahayak CRM project as a practical example. It will help you understand how concerns are separated in this real-world application.

## 1. What is MVC?

MVC is a design pattern used to decouple user-interfaces (view), data (model), and application logic (controller).

- **Model (M)**: Manages the data and business logic.
- **View (V)**: Handles the layout and display.
- **Controller (C)**: Routes commands to the model and view parts.

## 2. File Structure

Our project is aligned with MVC principles:

```
Sahayak CRM/
├── models/            # The Model layer
│   └── Complaint.js   # Database schema for the CRM complaints
│
├── views/             # The View layer
│   ├── index.html     # Customer facing UI
│   └── admin.html     # Admin dashboard UI
│
├── public/            # The auxiliary static assets (CSS, JS) for Views
│   ├── css/
│   └── js/
│
├── controllers/       # The Controller layer
│   ├── chatController.js      # Processes Gemini Chatbot logic
│   ├── authController.js      # Processes login logic
│   └── complaintController.js # Processes complaint logic
│
├── routes/            # Routes maps URLs to Controllers
│   ├── chatRoutes.js
│   ├── authRoutes.js
│   └── complaintRoutes.js
│
└── server.js          # The entry point initializing Model, View, and Controllers
```

## 3. How they Interact (Example: Chatting with Bot)

1. **User Action (View)**: The user typing a message in `views/index.html` submits it.
2. **Routing (server.js & routes/)**: The request goes to `/api/chat` mapped in `server.js` and defined in `routes/chatRoutes.js`.
3. **Logic (Controller)**: `routes/chatRoutes.js` passes the request to `controllers/chatController.js`. The controller formats the text and talks to Gemini.
4. **Data (Model occasionally)**: If the chatbot needed to check past complaints, it uses the Model (`models/Complaint.js`) to fetch from MongoDB. 
5. **Response (View)**: The chat UI receives the result back from the controller and shows it to the customer.

## Summary

By observing standard code comments in `Complaint.js` (Model), `server.js` (View & Routing integration), and `chatRoutes.js`/`chatController.js` (Controllers), you can see how strict code separation makes projects cleaner and easier to collaborate on.
