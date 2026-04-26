# Sahayak CRM

A full-stack, multilingual Customer Relationship Management (CRM) web application designed primarily for appliance repair shops. Sahayak CRM provides an inclusive platform focusing on regional language support, voice-assisted form filling, and AI conversational capabilities to accommodate non-technical customers seamlessly.

## 🚀 Features

- **Multilingual Support:** Dynamic, real-time UI translation across English, Hindi, Punjabi, Bengali, and Tamil natively shifting all context.
- **Voice Dictation (Web Speech API):** Click-to-talk mic integration lets users fill out complex text fields without typing, adapting automatically to their localized dialect.
- **Intelligent Chatbot (`Gemini`):** Context-aware conversational AI to help support end-users or administrators interact with the business domain intuitively.
- **Admin Dashboard & Authenticated JWT:** Role-based access limiting data visibility. Admins can view customer data through secure REST endpoints.
- **Glassmorphism UI:** Stunning, responsive, animations-first styling ensuring premium first impressions.

## 🛠️ Technology Stack

- **Frontend:** HTML5, Vanilla JavaScript, Custom CSS (Glassmorphism design)
- **Backend:** Node.js, Express.js 5.x
- **Database:** MongoDB (via Mongoose)
- **AI Integration:** Google Generative AI (Gemini)
- **Authentication:** JSON Web Tokens (JWT) & bcrypt

## ⚙️ Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone <repository_url>
   cd CRM
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Ensure you have a `.env` file at the root of the project with the following keys:
   ```env
   PORT=3000
   MONGO_URI=mongodb://127.0.0.1:27017/crm_db
   ADMIN_USERNAME=admin
   ADMIN_PASSWORD=admin@123
   JWT_SECRET=your_jwt_secret
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start MongoDB:**
   Ensure your local instance of MongoDB is running.

5. **Start the server:**
   ```bash
   node server.js
   ```

6. **Access Application:**
   Navigate your browser to `http://localhost:3000`. 
   For the admin dashboard, visit `http://localhost:3000/admin`.

## 📂 Project Structure

- `/public`: Static assets (`index.html`, `admin.html`)
  - `/css`: Styling modules.
  - `/js`: Client-side logic (`app.js`, `chatbot.js`, `translations.js`, `voiceInput.js`, `admin.js`, `adminChat.js`).
- `/controllers`: Request handlers (`authController.js`, `complaintController.js`).
- `/routes`: Express Router links mapping methods to controllers.
- `/models`: MongoDB Schemas (`Complaint.js`).
- `/services`: Third-party handler encapsulations (`geminiService.js`).
- `server.js`: Entry point.
