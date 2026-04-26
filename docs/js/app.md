# `public/js/app.js`

## Purpose

`app.js` is the main controller for the user-facing complaint workflow. It manages login by phone, complaint form navigation, complaint submission, complaint history, and language switching.

## Main Responsibilities

- Reads important DOM elements when the page loads
- Decides whether the user sees the login screen or dashboard
- Handles demo OTP generation and verification
- Fetches complaint history for the logged-in phone number
- Submits new complaints to the backend
- Updates UI text when the selected language changes

## Key Flow

### 1. Initial page state

When the script starts, it checks:

- `localStorage.getItem('userPhone')`

If a value exists, the user is treated as already logged in and the dashboard is shown. Otherwise, the login section is shown.

## View Helpers

The file uses three small helpers to switch the visible page state:

- `showLogin()`
- `showDashboard()`
- `showForm()`

These functions add or remove the `hidden` class on the relevant sections.

## OTP Login Logic

This file contains a demo OTP system implemented entirely in the browser:

- Clicking `btnGetOtp` generates a random 6-digit OTP
- The OTP is shown with `alert(...)`
- The OTP input section becomes visible
- On form submit, the entered OTP is compared with the generated one

If the OTP matches:

- the phone number is saved in `localStorage` as `userPhone`
- `currentUserPhone` is updated
- the dashboard is shown

This is convenient for demos, but it is not secure enough for production because the OTP is generated and verified on the client side.

## Complaint Fetching

The function `fetchUserComplaints(phone)` sends a request to:

- `/api/complaints/user/${phone}`

The response is rendered using `renderComplaints(complaints)`.

Each complaint is shown as a card with:

- product name
- status
- ticket ID
- problem description
- admin remarks if available

## Complaint Submission

When the complaint form is submitted:

- the submit button is disabled
- the form values are collected
- a `POST` request is sent to `/api/complaints`

Important detail:

- the phone number sent to the backend comes from `currentUserPhone`, not directly from a visible form input

That helps keep the complaint linked to the currently logged-in user.

On success:

- the UI shows a success message
- the new ticket ID is displayed
- the form resets
- the app returns to the dashboard after a short delay

## Language Switching

The script listens to changes on `langSelect`.

When the language changes:

- it reads the selected dictionary from `window.translations`
- it updates matching DOM element text by ID
- it updates placeholders for some inputs
- it tells the chatbot to update too, if `window.chatbot` exists

It also clears some fields so the user does not continue with partially translated inputs.

## Dependencies

`app.js` depends on:

- HTML elements with the expected IDs
- backend routes such as `/api/complaints` and `/api/complaints/user/:phone`
- `window.translations` from `translations.js`
- optionally `window.chatbot` from `chatbot.js`

## Why It Matters

This is the main user-side coordinator. Without it, the customer login flow, complaint submission flow, complaint history view, and language switching would stop working.
