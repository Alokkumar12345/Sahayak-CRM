# `public/js/admin.js`

## Purpose

`admin.js` controls the admin-side dashboard for complaint management.

## Main Responsibilities

- Handles admin login
- Stores and reuses the admin token
- Loads complaint data from the backend
- Applies complaint filters
- Renders the complaint table
- Opens the remarks modal
- Marks complaints as resolved
- Shows or hides the admin chat widget

## Initial Setup

When the page loads, the script collects references to:

- login elements
- dashboard elements
- filter controls
- table container
- remarks modal controls

It also reads:

- `localStorage.getItem('adminToken')`

If a token already exists, the dashboard is shown immediately.

## Admin Login

The login form submits a `POST` request to:

- `/api/auth/login`

with:

```json
{
  "username": "...",
  "password": "..."
}
```

If the response contains a token:

- the token is saved to `localStorage`
- `currentToken` is updated
- the dashboard is shown

If login fails, an error message is displayed inside `#loginMessage`.

## Logout

Clicking the logout button:

- removes `adminToken` from `localStorage`
- clears the in-memory token
- hides the dashboard
- shows the login section again
- hides the admin chat widget

## Complaint Fetching

The function `fetchComplaints()` sends a request to:

- `/api/complaints`

Optional query parameters are added from:

- `filterShop`
- `filterStatus`

The request includes:

```http
Authorization: Bearer <token>
```

If the backend responds with `401` or `403`, the script forces logout because the token is considered invalid or expired.

## Table Rendering

`renderTable(complaints)` rebuilds the complaint table body from scratch.

Each row shows:

- ticket ID
- customer name
- phone
- shop
- product
- problem
- status
- remarks
- action button

The script also checks the table header and inserts a `Remarks` column if it is missing.

If no complaints are found, a single table row with a "No complaints found" message is displayed.

## Resolve Complaint Flow

When an unresolved complaint is shown, the row includes a `Mark Resolved` button.

That button calls:

- `window.markResolved(id)`

This stores the selected complaint ID and opens the remarks modal.

When the admin confirms:

- a `PUT` request is sent to `/api/complaints/:id`
- the payload contains:
  - `status: "Resolved"`
  - `remarks`

If the request succeeds:

- the modal closes
- the input is cleared
- complaints are fetched again to refresh the table

## Why `window.markResolved` Exists

The button HTML is generated using inline `onclick`.

Because of that, the function must be attached to `window` so the browser can find it from the global scope.

## Dependencies

`admin.js` depends on:

- admin page DOM elements being present
- `/api/auth/login`
- `/api/complaints`
- `/api/complaints/:id`
- `localStorage` for token persistence

## Why It Matters

This file is the main admin dashboard controller. It is responsible for authentication state, complaint listing, filtering, and resolution actions.
