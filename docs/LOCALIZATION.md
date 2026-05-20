# Localization Guide

This guide provides instructions on how to localize the AI Project Tracker for different languages and regions. Localization ensures that the application can adapt to the needs of diverse users around the globe.

---

## Introduction
Localization involves adapting the language, formats, and content of the AI Project Tracker to align with a specific locale. This guide explains the steps for adding new languages, customizing locale-specific settings, and managing translations.

---

## Understanding Localization in the AI Project Tracker

The AI Project Tracker uses JSON files to manage translations and locale-specific settings. These files are organized as follows:

```
locales/
|-- en.json  # English translations
|-- fr.json  # French translations
|-- es.json  # Spanish translations
```

- **`en.json`**: The default language file, containing all the keys and their English values.
- **`fr.json`**: An example translation file for French.
- **`es.json`**: An example translation file for Spanish.

---

## Adding a New Language

### Step 1: Create a New Translation File
1. Navigate to the `locales/` directory.
2. Copy the default `en.json` file and rename it to the desired locale (e.g., `de.json` for German).
3. Open the new file and replace the English values with translations. For example:
   ```json
   {
     "welcome_message": "Willkommen im AI-Projekt-Tracker",
     "error_message": "Ein Fehler ist aufgetreten"
   }
   ```

### Step 2: Update the Locale Configuration
1. Locate the `config/locales.js` file in the source code.
2. Add the new language to the `availableLocales` array:
   ```javascript
   const availableLocales = ['en', 'fr', 'es', 'de'];
   ```

### Step 3: Test the New Locale
1. Start the application.
2. Set the desired language in the `.env` file:
   ```plaintext
   DEFAULT_LOCALE=de
   ```
3. Verify that the application displays the translations correctly.

---

## Managing Existing Translations

### Step 1: Review Translation Keys
- Translation keys in `en.json` should be descriptive and self-explanatory.
  Example:
  ```json
  {
    "save_button": "Save",
    "cancel_button": "Cancel"
  }
  ```

### Step 2: Update Outdated Translations
- If new features are added, ensure the translation keys are updated across all locale files.
  Example:
  ```json
  {
    "new_feature_message": "Check out this new feature."
  }
  ```

### Step 3: Use a Translation Tool (Optional)
- Use tools like [Poedit](https://poedit.net/) or [Lokalise](https://lokalise.com/) to streamline translation workflows.

---

## Formatting Locale-Specific Data

### Date and Time Formats
The AI Project Tracker uses the [Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat) API for formatting dates and times.

1. Update the `DEFAULT_LOCALE` in `.env` to the desired locale:
   ```plaintext
   DEFAULT_LOCALE=en-US
   ```
2. The application will automatically use locale-specific formats for rendering dates and times.

### Currency Formats
The tracker provides support for locale-specific currency formats. To update:
1. Open the `.env` file.
2. Set the `DEFAULT_CURRENCY` value:
   ```plaintext
   DEFAULT_CURRENCY=USD
   ```
   Supported currencies include `USD`, `EUR`, `JPY`, etc.

---

## Best Practices for Localization

1. **Keep Translation Keys Consistent**:
   - Keys should reflect the context of the text. For example:
     - Bad key: `button_1`
     - Good key: `save_button`

2. **Avoid Hardcoding Text**:
   - Always use keys from the locale files instead of hardcoded text in the code.
     - Example:
       ```javascript
       import i18n from '../locales';

       console.log(i18n.t('welcome_message'));
       ```

3. **Test Each Locale**:
   - Switch between locales during testing to ensure all translations are displayed correctly.

---

For further assistance, refer to the [Troubleshooting Guide](./TROUBLESHOOTING.md) or open an issue on the GitHub repository.