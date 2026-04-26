# `public/js/voiceInput.js`

## Purpose

`voiceInput.js` provides reusable speech-to-text behavior for form fields in the complaint flow.

It is different from `chatbot.js` because it is focused on filling inputs like name, machine ID, problem, and address rather than sending chat messages.

## Main Responsibilities

- Creates one browser speech recognition instance
- Starts and stops recording for individual form fields
- Appends transcribed speech into the selected input
- Supports a "full voice" mode that targets the next empty field
- Changes speech language based on the selected UI language

## Class Structure

The file defines a `VoiceInput` class with these important state values:

- `recognition`
- `isRecording`
- `currentMicBtn`
- `currentTargetId`

These values help the script know which button started the recording and which field should receive the transcript.

## Initialization

Inside `init()`:

- the script first checks whether `webkitSpeechRecognition` exists
- if not supported, it logs a warning and does nothing else
- if supported, it creates the recognizer and assigns browser event handlers

## Recognition Events

### `onstart`

- sets `isRecording = true`
- adds the `recording` CSS class to the active mic button

### `onresult`

- reads the recognized transcript
- finds the current target input by ID
- appends the new words to the existing value

### `onerror`

- logs the error
- stops recording cleanly

### `onend`

- calls `stopRecording()` to reset UI state

## Mic Buttons

The script attaches click handlers to every `.mic-btn`.

Each mic button is expected to contain:

- `data-target="inputId"`

When clicked, the script records speech for that specific target field.

## Full Voice Mode

If `#btnFullVoice` exists, the script supports a guided mode.

It checks a list of fields in order:

- `name`
- `phone`
- `machineId`
- `problem`
- `address`

It chooses the first empty field and starts recording into it.

If all fields already have content, it defaults to the last field in the list.

## Language Selection

Before recording starts, the script reads `#langSelect` and maps the selected app language to a speech recognition locale:

- `english -> en-IN`
- `hindi -> hi-IN`
- `punjabi -> pa-IN`
- `bengali -> bn-IN`
- `tamil -> ta-IN`

## Dependencies

`voiceInput.js` depends on:

- a browser that supports `webkitSpeechRecognition`
- form mic buttons with `.mic-btn` and `data-target`
- optional `#btnFullVoice`
- optional `#langSelect`

## Why It Matters

This file makes the complaint form easier to use for people who prefer speaking over typing, especially in multilingual scenarios.
