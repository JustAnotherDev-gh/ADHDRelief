# Localization (i18n) Documentation

ADHDRelief is fully localized and supports **6 languages** using Chrome Extension's built-in i18n API.

## Supported Languages

| Language Code | Language Name | Status |
|--------------|---------------|---------|
| `en` | English (Default) | ✅ Complete |
| `de` | German (Deutsch) | ✅ Complete |
| `es` | Spanish (Español) | ✅ Complete |
| `fr` | French (Français) | ✅ Complete |
| `ja` | Japanese (日本語) | ✅ Complete |
| `ru` | Russian (Русский) | ✅ Complete |

## How It Works

The extension automatically detects the user's browser language and displays the appropriate translation. If the browser language isn't supported, it falls back to English.

### File Structure

```
_locales/
├── en/
│   └── messages.json      # English (default)
├── de/
│   └── messages.json      # German
├── es/
│   └── messages.json      # Spanish
├── fr/
│   └── messages.json      # French
├── ja/
│   └── messages.json      # Japanese
└── ru/
    └── messages.json      # Russian
```

### Translated Elements

All user-facing text is translated, including:

#### Extension Metadata
- Extension name
- Extension description (shown in Chrome Web Store)

#### UI Elements
- Mode buttons (Continuous / Break Mode)
- Sound type names (Brown, Pink, Grey, Rain, etc.)
- Control buttons (Play, Pause, Start Timer, Stop Timer)
- Status messages (Playing, Stopped)
- Timer phases (Focus, Break)
- Presets (25/5, 50/10, Custom)
- Labels (Volume, Focus duration, Break duration)

#### Dialogs & Messages
- Custom sound dialog (Name Your Vibe)
- Input placeholders
- Button text (Save, Cancel)
- Error messages
- Tooltips

## Adding a New Language

To add support for a new language:

### 1. Create Directory

```bash
mkdir -p _locales/[language_code]
```

Example for Italian:
```bash
mkdir -p _locales/it
```

### 2. Copy English Template

```bash
cp _locales/en/messages.json _locales/it/messages.json
```

### 3. Translate Messages

Edit `_locales/it/messages.json` and translate all `message` values:

```json
{
  "extensionName": {
    "message": "ADHDRelief - Concentrazione e Relax",
    "description": "Name of the extension"
  },
  "extensionDescription": {
    "message": "Concentrati e rilassati con suoni ambientali...",
    "description": "Description of the extension"
  },
  // ... continue for all keys
}
```

**Important:**
- Keep the JSON structure identical
- Translate only the `message` field
- Do NOT change the keys (`extensionName`, `soundBrown`, etc.)
- Maintain special characters and formatting
- Test the translation in Chrome

### 4. Test the Translation

1. Set Chrome to the new language:
   - `chrome://settings/languages`
   - Add and move your language to the top
2. Restart Chrome
3. Load the extension
4. Verify all text appears correctly

## Translation Guidelines

### Do's
✅ Translate all UI text naturally for the target language
✅ Keep button text short (target language may be longer)
✅ Maintain the tone: professional, calming, ADHD-friendly
✅ Use consistent terminology throughout
✅ Test with actual native speakers if possible

### Don'ts
❌ Don't translate technical terms unnecessarily (e.g., "Pomodoro", "Lofi")
❌ Don't change JSON structure or keys
❌ Don't use machine translation without review
❌ Don't exceed reasonable character limits for buttons
❌ Don't translate the extension ID or version numbers

## Implementation Details

### In HTML (`popup/popup.html`)

Elements use `data-i18n` attributes:

```html
<button data-i18n="modeConstant">Continuous</button>
<input data-i18n-placeholder="dialogPlaceholder" placeholder="...">
<button data-i18n-title="tooltipMyVibe" title="...">
```

### In JavaScript (`popup/popup.js`)

Use the `i18n()` helper function:

```javascript
function i18n(key) {
  return chrome.i18n.getMessage(key);
}

// Usage
elements.playStatus.textContent = i18n('statusPlaying');
alert(i18n('errorInvalidFile'));
```

### In manifest.json

Use special `__MSG_key__` syntax:

```json
{
  "name": "__MSG_extensionName__",
  "description": "__MSG_extensionDescription__",
  "default_locale": "en"
}
```

## Localized Strings Reference

### Extension Metadata
- `extensionName` - Extension name in store/browser
- `extensionDescription` - Short description (132 char limit for store)

### Modes
- `modeConstant` - Continuous mode
- `modeBreak` - Break mode

### Sounds
- `soundBrown` - Brown noise
- `soundPink` - Pink noise
- `soundGrey` - Grey noise
- `soundRain` - Rain
- `soundOceanSurf` - Ocean surf
- `soundForestWaterfall` - Forest waterfall
- `soundLofiLoop` - Lofi loop

### Controls
- `btnMyVibe` - My Vibe button
- `btnPlay` - Play button
- `btnPause` - Pause button
- `btnSave` - Save button
- `btnCancel` - Cancel button
- `btnStartTimer` - Start timer button
- `btnStopTimer` - Stop timer button

### Status
- `statusPlaying` - Playing status
- `statusStopped` - Stopped status

### Timer
- `timerTitle` - Timer section title
- `phaseBreak` - Break phase
- `phaseFocus` - Focus phase
- `presetPomodoro` - 25/5 preset
- `presetExtended` - 50/10 preset
- `presetCustom` - Custom preset

### Labels
- `labelVolume` - Volume label
- `labelFocusDuration` - Focus duration label
- `labelBreakDuration` - Break duration label

### Dialog
- `dialogTitle` - Custom sound dialog title
- `dialogPlaceholder` - Input placeholder

### Tooltips
- `tooltipDelete` - Delete sound tooltip
- `tooltipMyVibe` - Upload audio tooltip
- `tooltipVolume` - Volume slider tooltip

### Errors
- `errorInvalidFile` - Invalid audio file error
- `errorNameRequired` - Name required error
- `errorSaveFailed` - Save failed error

## Testing Checklist

When adding or updating translations:

- [ ] Extension name appears correctly in `chrome://extensions`
- [ ] All buttons show translated text
- [ ] Mode switching shows correct labels
- [ ] All sound names are translated
- [ ] Timer shows translated phases (Focus/Break)
- [ ] Presets show correct labels
- [ ] Custom sound dialog is fully translated
- [ ] Error messages appear in target language
- [ ] Tooltips appear in target language
- [ ] No text is cut off or overflows
- [ ] Text layout looks good (some languages are longer)

## Language Codes Reference

For reference, here are common language codes:

| Code | Language |
|------|----------|
| `en` | English |
| `de` | German |
| `es` | Spanish |
| `fr` | French |
| `it` | Italian |
| `ja` | Japanese |
| `ko` | Korean |
| `pt_BR` | Portuguese (Brazil) |
| `pt_PT` | Portuguese (Portugal) |
| `ru` | Russian |
| `zh_CN` | Chinese (Simplified) |
| `zh_TW` | Chinese (Traditional) |
| `ar` | Arabic |
| `hi` | Hindi |
| `nl` | Dutch |
| `pl` | Polish |
| `tr` | Turkish |
| `vi` | Vietnamese |

## Resources

- [Chrome i18n API Documentation](https://developer.chrome.com/docs/extensions/reference/i18n/)
- [Chrome Supported Locales](https://developer.chrome.com/docs/webstore/i18n/#choosing-locales-to-support)
- [ISO 639-1 Language Codes](https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes)

## Contributing Translations

We welcome contributions for new languages! To contribute:

1. Fork the repository
2. Add your language following the steps above
3. Test thoroughly
4. Submit a pull request with:
   - The new `_locales/[code]/messages.json` file
   - Screenshots showing the translated UI
   - Note if you're a native speaker or used tools

---

**Current Translation Coverage: 6 languages (en, de, es, fr, ja, ru)**

Thank you to all contributors for making ADHDRelief accessible globally! 🌍
