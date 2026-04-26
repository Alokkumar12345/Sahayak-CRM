# `public/js/adminChat.js`

## Purpose

`adminChat.js` defines the admin chatbot UI used for complaint-related queries in natural language.

Examples of expected questions are things like:

- "Show all pending complaints from Shop 3"
- "List resolved complaints"
- "Find complaints for a phone number"

## Main Responsibilities

- Opens and closes the admin chat widget
- Sends admin chat messages to `/api/chat`
- Includes the admin auth token in chat requests
- Stores chat history locally in memory
- Displays assistant responses
- Supports speech input for admin queries

## Class Structure

The file defines an `AdminChat` class.

The constructor initializes the conversation with a single assistant message and then calls `init()`.

## UI Behavior

Inside `init()`, the script wires up:

- chat open button
- chat close button
- send button
- Enter key on the input
- microphone button

If the toggle button does not exist, the script exits early so it does not fail on pages where the widget is absent.

## Sending Messages

`sendMessage()` does the following:

- reads the text from `#adminChatInput`
- ignores blank input
- appends the user message to the UI
- saves it into `this.messages`
- shows the typing indicator
- sends the conversation to `/api/chat`

The request includes:

- `messages`
- `language: "english"`
- `Authorization: Bearer <adminToken>`

The token is read from:

- `localStorage.getItem('adminToken')`

If the backend returns a reply, the script appends it to the UI and saves it in the in-memory chat history.

## Voice Input

If `webkitSpeechRecognition` is available:

- the script creates a recognizer
- sets the language to `en-IN`
- sends the recognized speech as a chat message

If speech recognition is unavailable, the mic button is hidden.

Unlike the customer chatbot, the admin chat does not switch languages dynamically. It is fixed to English.

## Message Rendering

`appendMessage(sender, text)` creates a `.message` element with a `.msg-bubble` child and inserts it just above the typing indicator.

That keeps the loading indicator pinned to the end of the chat stream.

## Dependencies

`adminChat.js` depends on:

- admin chat DOM elements existing in the page
- `/api/chat`
- a valid admin token stored in `localStorage`

## Why It Matters

This file provides a more natural way for admins to query complaint information without manually filtering only through the dashboard UI.
