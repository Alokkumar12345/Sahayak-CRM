# `public/js/chatbot.js`

## Purpose

`chatbot.js` defines the customer chat widget used to help users file complaints or ask support-related questions.

## Main Responsibilities

- Opens and closes the chat widget
- Sends user messages to `/api/chat`
- Stores chat history in memory
- Displays assistant responses in the chat window
- Supports quick reply chips
- Supports microphone input with browser speech recognition
- Updates visible chat text when the UI language changes

## Class Structure

The file defines a `Chatbot` class.

The constructor creates an initial message history with one assistant welcome message and then calls `init()`.

## Message Format

The script stores messages in this shape:

```js
{ role: "user", content: "..." }
{ role: "assistant", content: "..." }
```

This format is useful because it keeps the whole conversation ready to send to the backend.

## UI Setup

Inside `init()`, the script wires up:

- chat open button
- chat close button
- send button
- Enter key submission
- quick reply chips
- chat microphone button

If the widget root element is missing, the script exits safely.

## Sending Messages

`sendMessage()` does the following:

- reads the current text from `#chatInput`
- ignores empty input
- appends the user message to the UI
- saves the message in `this.messages`
- reads the currently selected language
- sends the full conversation to `/api/chat`

The payload includes:

- `messages`
- `language`

If the backend returns `data.reply`, the response is shown in the UI and also pushed into `this.messages`.

## Typing Indicator

While waiting for the backend response, the script shows `#typingIndicator`.

When the response arrives or fails:

- the typing indicator is hidden

## Quick Reply Chips

The script reads chips from:

- `.chat-quick-replies .chip`

Each chip has a `data-text` attribute. Clicking a chip copies that text into the input and immediately sends it.

## Voice Input

If `webkitSpeechRecognition` is available:

- the script creates a speech recognizer
- it chooses the recognition language based on `#langSelect`
- recognized speech is copied into the chat input
- the message is sent automatically

If speech recognition is not available, the mic button is hidden.

## Language Updates

The method `updateLanguage(lang)` updates:

- quick reply chip text
- the initial welcome message, but only if the conversation still contains just the first assistant message

It reads translation values from `window.translations`.

## Dependencies

`chatbot.js` depends on:

- chat-related DOM elements existing in the page
- `/api/chat` returning JSON with a `reply` field
- `window.translations` for translated chip text and welcome text

## Why It Matters

This file is the entire customer chatbot frontend. It does not generate answers itself, but it controls the user interaction around the backend chat service.
