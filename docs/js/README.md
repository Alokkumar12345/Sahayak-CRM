# JavaScript Folder Documentation

This folder documents the frontend files inside `public/js`.

## Files Covered

- [app.md](./app.md): Main user-side application flow
- [chatbot.md](./chatbot.md): Customer chatbot behavior
- [voiceInput.md](./voiceInput.md): Voice-to-text helper for form fields
- [translations.md](./translations.md): Translation dictionary for the UI
- [admin.md](./admin.md): Admin dashboard logic
- [adminChat.md](./adminChat.md): Admin chatbot behavior

## Architecture Summary

The `public/js` folder is split by responsibility:

- `app.js` controls the customer experience such as login, dashboard switching, complaint submission, and language changes.
- `chatbot.js` controls the customer chat widget and sends chat requests to `/api/chat`.
- `voiceInput.js` adds speech recognition support to form inputs.
- `translations.js` stores the language text used by the UI.
- `admin.js` controls admin login, complaint listing, filters, and complaint resolution.
- `adminChat.js` controls the admin chat widget and sends authenticated chat requests.

## Shared Patterns

- All files are browser-side scripts and run after `DOMContentLoaded`.
- Most scripts depend on HTML element IDs being present in the page.
- Some scripts communicate through global variables on `window`, such as `window.translations` and `window.chatbot`.
- Data is fetched from backend endpoints like `/api/complaints`, `/api/auth/login`, and `/api/chat`.
