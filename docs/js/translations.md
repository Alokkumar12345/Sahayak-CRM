# `public/js/translations.js`

## Purpose

`translations.js` contains the translation dictionary used by the frontend.

At the end of the file, it exposes the dictionary globally as:

```js
window.translations = translations;
```

That allows other scripts to read translated UI text without importing modules.

## Languages Included

The file contains translation entries for:

- english
- hindi
- punjabi
- bengali
- tamil

## What Each Language Block Contains

Each language object contains text for:

- branding
- form titles and labels
- placeholder text
- button text
- navigation labels
- chatbot chip labels
- chatbot welcome text

## Key Design Pattern

Most translation keys are intentionally named to match HTML element IDs, for example:

- `brandName`
- `formTitle`
- `labelName`
- `btnSubmit`

This makes it easy for `app.js` to loop through the keys and update matching DOM elements.

The file also contains placeholder keys like:

- `placeholderName`
- `placeholderProblem`
- `placeholderAddress`

These are used to update input placeholders instead of regular text content.

## Where It Is Used

This file is mainly used by:

- `app.js` for page text and placeholders
- `chatbot.js` for quick reply labels and welcome text

## Important Note About Encoding

Some non-English strings may appear garbled in terminals or editors that are not reading the file with the correct encoding.

If the text looks wrong in the browser too, save the file as UTF-8 so Hindi, Punjabi, Bengali, and Tamil characters render properly.

## Why It Matters

This file is the central text source for the multilingual frontend. If you want to add a new language or update UI copy, this is the main place to do it.
