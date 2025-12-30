# ADHDRelief - Focus & Relaxation Browser Extension

A lightweight Chrome extension that helps you focus and relax with various ambient sounds including brown noise, nature sounds, and lofi beats. Designed with ADHD-friendly features and smart timer modes for productivity.

## Features

### 🎵 Multiple Sound Types

**Generated Noise:**
- **Brown Noise** - Deep, soothing low-frequency noise
- **Pink Noise** - Balanced across all frequencies
- **Grey Noise** - Psychoacoustically balanced "equal loudness"

**Nature Sounds:**
- **Rain** - Gentle rainfall ambiance
- **Ocean Surf** - Calming ocean waves
- **Forest Waterfall** - Peaceful forest stream

**Lofi Music:**
- **Lofi Loop** - 6 curated lofi hip-hop tracks playing sequentially

**Custom Sounds:**
- **My Vibe** - Upload and play your own audio files (MP3, WAV, OGG, etc.)
- Drag-and-drop to reorder your custom sounds
- Name your custom vibes for easy identification

### 🧠 Two Focus Modes

#### 1. Continuous Mode
- Sound plays continuously
- Best for deep work, coding, reading, studying
- Simple on/off control
- Consistent ambient background

#### 2. Break Mode
- Sound plays **only during break periods**
- Silence during focus time
- Auto-switches between focus and break phases
- Helps reset attention and reduce mental fatigue
- Gradual 5-second fade-in when breaks start

### ⏱️ Built-in Timer

- **Presets**: 25/5 (Pomodoro), 50/10, or Custom durations
- Auto-switching between focus and break phases
- Visual phase indicator (Focus/Break)
- Persistent timer state across browser sessions
- Works perfectly with Break Mode

### 🎮 User-Friendly Controls

- Large, ADHD-friendly buttons (minimum 44x44px)
- Volume slider with smooth transitions
- One-click play/pause
- Keyboard shortcuts for quick access
- Clear visual feedback

### 🎨 Design Principles

- Zero distraction interface
- Dark mode by default
- Muted, calming color palette
- No flashing elements or animations
- Clear visual hierarchy
- Accessibility-focused design

### 🔒 Privacy First

- **No accounts required**
- **No tracking or analytics**
- **Fully client-side** - all processing happens in your browser
- **No external requests** - no internet connection needed after installation
- **No permissions beyond storage and audio**
- Your usage data never leaves your machine

**What you hear stays on your machine.**

## Installation

### From Chrome Web Store (Recommended)

Coming soon!

### Load Unpacked Extension (Development)

1. Download or clone this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top right)
4. Click "Load unpacked"
5. Select the `ADHDRelief` folder
6. The extension icon should appear in your toolbar

### Verify Installation

1. Click the extension icon to open the popup
2. You should see:
   - Mode selector (Continuous / Break Mode)
   - Sound selector buttons (Brown, Pink, Grey, Rain, etc.)
   - Large play button
   - Volume slider
   - Timer section (when in Break Mode)

## Usage

### Basic Usage (Continuous Mode)

1. Click the extension icon
2. Ensure "Continuous" mode is selected
3. Select a sound type (Brown, Pink, Rain, Lofi Loop, etc.)
4. Click the play button (▶️)
5. Adjust volume as needed
6. Sound will play continuously until you stop it

### Break Mode Usage

1. Click the extension icon
2. Select "Break Mode"
3. Choose a timer preset (25/5, 50/10, or Custom)
4. Select your preferred sound
5. Click "Start Timer"
6. During **Focus** periods: sound is OFF (silence for concentration)
7. During **Break** periods: sound is ON (gradual fade-in)
8. Timer auto-switches between phases

### Adding Custom Sounds

1. Click the "My Vibe" button
2. Select an audio file from your computer (MP3, WAV, OGG, FLAC, etc.)
3. Enter a name for your custom sound
4. Click "Save"
5. Your custom sound appears in the sound selector
6. Drag and drop to reorder sounds
7. Click the × button to delete custom sounds

### Keyboard Shortcuts

- `Alt+Shift+P` - Toggle play/pause
- `Alt+Shift+M` - Switch between Continuous and Break mode
- `Alt+Shift+Up` - Increase volume (+10)
- `Alt+Shift+Down` - Decrease volume (-10)

You can customize these shortcuts in `chrome://extensions/shortcuts`

## File Structure

```
ADHDRelief/
├── manifest.json                 # Extension manifest (Manifest V3)
├── README.md                     # This file
├── LICENSE                       # Apache 2.0 License
├── popup/
│   ├── popup.html               # Extension popup UI
│   ├── popup.css                # ADHD-friendly styling
│   ├── popup.js                 # Popup logic and UI controller
│   └── custom-sounds.js         # IndexedDB manager for custom sounds
├── background/
│   └── service-worker.js        # State management, timer, offscreen lifecycle
├── offscreen/
│   ├── offscreen.html           # Minimal HTML for audio context
│   └── audio-generator.js       # Web Audio API sound generator
├── sounds/
│   ├── rain.wav                 # Rain sound effect
│   ├── ocean_surf.wav           # Ocean waves sound
│   ├── forest-waterfall.wav     # Forest waterfall sound
│   ├── lofi_1.mp3               # Lofi track 1
│   ├── lofi_2.mp3               # Lofi track 2
│   ├── lofi_3.mp3               # Lofi track 3
│   ├── lofi_4.mp3               # Lofi track 4
│   ├── lofi_5.mp3               # Lofi track 5
│   └── lofi_6.mp3               # Lofi track 6
└── icons/
    ├── icon16.png               # 16x16 toolbar icon
    ├── icon48.png               # 48x48 extension page icon
    ├── icon128.png              # 128x128 Chrome Web Store icon
    └── generate-icons.py        # Script to regenerate icons
```

## Technical Details

### Architecture

- **Manifest V3** for future compatibility and security
- **Service Worker** for background logic and persistent state management
- **Offscreen Document** for Web Audio API (service workers can't use AudioContext directly)
- **IndexedDB** for storing custom audio files
- **Chrome Storage** for state persistence
- **Chrome Alarms** for accurate timer functionality

### Sound Generation

**Synthetic Noise (Brown/Pink/Grey):**
- Generated in real-time using Web Audio API
- Brown noise: Random walk algorithm with low-pass filtering
- Pink noise: Voss-McCartney algorithm with multiple generators
- Grey noise: Equal-loudness curve applied to pink noise
- Seamlessly loops without artifacts

**Audio Files (Nature Sounds & Lofi):**
- Loaded from bundled WAV/MP3 files
- Decoded using Web Audio API's `decodeAudioData()`
- Lofi Loop: Sequential playback of 6 tracks (4→1→3→5→2→6→4...)

**Custom Sounds:**
- User audio files stored in IndexedDB
- Supports MP3, WAV, OGG, FLAC, and other browser-supported formats
- Converted to AudioBuffer for playback

### State Management

All state persists in `chrome.storage.local`:
- `isPlaying` - Current playback state
- `mode` - Continuous or Break mode
- `noiseType` - Selected sound type
- `volume` - Volume level (0-100)
- `timerState` - Timer configuration and current state

Custom sounds persist in IndexedDB:
- Audio data as Blob
- Sound metadata (name, order)

### Communication Flow

```
Popup UI ←→ Service Worker ←→ Offscreen Document
   ↓              ↓                    ↓
Messages      State/Timer         Audio Generation
   ↓              ↓                    ↓
IndexedDB    Chrome Storage      Web Audio API
```

## Development

### Prerequisites

- Python 3 with Pillow (for icon generation)
- Chrome browser version 109+ (or any Chromium-based browser)

### Regenerate Icons

```bash
cd icons
python3 generate-icons.py
```

### Debugging

1. **Service Worker Console**:
   - Go to `chrome://extensions/`
   - Find ADHDRelief
   - Click "Inspect views: service worker"

2. **Popup Console**:
   - Right-click extension icon
   - Select "Inspect popup"

3. **Offscreen Document**:
   - Logs appear in service worker console
   - Look for `[ADHDRelief]` prefixed messages

### Common Issues

**No audio playing:**
- Check browser volume and extension volume slider
- Verify extension has necessary permissions
- Check service worker console for errors
- Try refreshing the extension

**Custom sound not uploading:**
- Ensure file format is supported (MP3, WAV, OGG, etc.)
- Check file size (very large files may take time to process)
- Check browser console for errors

**Timer not working:**
- Verify `chrome.alarms` permission in manifest
- Check service worker console for timer logs
- Ensure Break Mode is selected

**State not persisting:**
- Verify `chrome.storage` permission
- Check service worker console for storage errors
- Clear extension data and try again

## Browser Compatibility

- **Chrome 109+** (Manifest V3 with offscreen documents)
- **Edge 109+** (Chromium-based)
- **Brave, Opera, Vivaldi** (recent versions with Manifest V3 support)

**Note**: Firefox uses a different extension API and is not currently supported.

## Localization

ADHDRelief is available in **6 languages**:
- 🇬🇧 English (default)
- 🇩🇪 German (Deutsch)
- 🇪🇸 Spanish (Español)
- 🇫🇷 French (Français)
- 🇯🇵 Japanese (日本語)
- 🇷🇺 Russian (Русский)

The extension automatically detects your browser language. See [LOCALIZATION.md](LOCALIZATION.md) for details on adding new languages.

## Privacy

ADHDRelief is designed with privacy as a core principle:

- ✅ **No user accounts** - No sign-up, no login
- ✅ **No tracking or analytics** - We don't collect any usage data
- ✅ **No external network requests** - All processing is local
- ✅ **No permissions beyond audio & storage** - We only request what's needed
- ✅ **Your data stays on your device** - Custom sounds are stored locally in IndexedDB
- ✅ **Open source** - Inspect the code yourself

**Your focus sessions, sound preferences, and custom audio files never leave your browser.**

📄 **For complete details, see our [Privacy Policy](PRIVACY_POLICY.md)**

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

### Development Guidelines

1. Follow the existing code style
2. Test all changes thoroughly
3. Update documentation as needed
4. Keep the design ADHD-friendly (large buttons, clear hierarchy, no animations)
5. Maintain privacy-first principles

## License

See [LICENSE](LICENSE) file for full details.

Sounds are distributed under sounds/LICENSE,

## Acknowledgments

- Sound assets are licensed under the Creative Commons Attribution 4.0 International (CC BY 4.0). Attribution required.

## Support

For issues, feature requests, or questions submit an issue on GitHub.

---

**Built with focus, for focus. 🎧**

*ADHDRelief helps you create the perfect auditory environment for deep work, relaxation, and everything in between.*
