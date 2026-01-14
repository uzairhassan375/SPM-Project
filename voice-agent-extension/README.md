# Voice-Controlled Browser Automation Chrome Extension

A Chrome Extension that enables voice-controlled browser automation using the Web Speech API. Control your browser tabs, navigate websites, perform searches, and interact with web pages using natural language voice commands.

## Features

- 🎤 **Voice Recognition Feature**: Uses Web Speech API for accurate voice command recognition
- 🔊 **Voice Feedback**: Text-to-speech confirmation for executed commands
- 📑 **Tab Management**: Open, close, switch, and reload tabs with voice commands
- 🌐 **Navigation**: Navigate to any website using voice
- 🔍 **Search**: Perform Google and YouTube searches via voice
- 📜 **Page Interaction**: Scroll pages, click buttons, and fill input fields
- 🔖 **Bookmarks**: Add and remove bookmarks using voice
- 🪟 **Window Management**: Minimize and maximize browser windows

## Installation Process

### Method 1: Load Unpacked Extension (Development)

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" (toggle in top-right corner)
4. Click "Loads unpacked"
5. Select the `voice-agent-extension` folder
6. The extension should now appear in your extensions list

### Method 2: Install from Chrome Web Store (When Published)

1. Visit the Chrome Web Store
2. Search for "Voice-Controlled Browser Automation"
3. Click "Add to Chrome"
4. Confirm installation

## Usage

### Starting Voice Control

1. Click the extension icon in the Chrome toolbar
2. Click "Start Voice Control" button
3. The status indicator will show "Listening..."
4. Speak your commands naturally

### Voice Commands

#### Tab Management
- **Open Tab**: "Open Google", "Open a new tab for YouTube"
- **Close Tab**: "Close tab", "Close this tab"
- **Switch Tab**: "Switch to next tab", "Previous tab"
- **Reload Tab**: "Reload", "Refresh page"

#### Navigation
- **Navigate**: "Go to GitHub", "Visit Facebook", "Navigate to Google"

#### Search
- **Google Search**: "Search for cats", "Google weather today"
- **YouTube Search**: "YouTube funny videos", "Search YouTube for tutorials"

#### Page Actions
- **Scroll**: "Scroll down", "Scroll up"
- **Click**: "Click login button", "Press submit"
- **Fill Input**: "Fill username with john", "Type password as mypass123"

#### Bookmarks
- **Add Bookmark**: "Add bookmark", "Save bookmark"
- **Remove Bookmark**: "Remove bookmark", "Delete bookmark"

#### Window Management
- **Minimize**: "Minimize window"
- **Maximize**: "Maximize window"

## Technical Details

### Architecture

- **Manifest V3**: Uses the latest Chrome Extension manifest version
- **Service Worker**: Background script handles command execution
- **Content Scripts**: Injected into web pages for voice recognition
- **Modular Design**: Separated concerns with dedicated modules

### Technology Stack

- **Chrome Extension APIs**: tabs, scripting, activeTab, storage, bookmarks
- **Web Speech API**: SpeechRecognition and SpeechSynthesis
- **JavaScript ES6+**: Modern JavaScript with classes and modules
- **HTML/CSS**: Clean, modern UI design

### File Structure

```
voice-agent-extension/
├── manifest.json          # Extension manifest (Manifest V3)
├── popup.html            # Extension popup UI
├── popup.css             # Popup styles
├── popup.js              # Popup logic
├── background.js         # Service worker for command execution
├── contentScript.js      # Content script for voice recognition
├── voiceEngine.js        # Voice recognition and TTS engine
├── intentParser.js       # Natural language intent parsing
├── commandExecutor.js    # Command execution handler
├── utils/
│   └── helpers.js        # Utility functions
└── README.md             # This file
```

## Permissions

The extension requires the following permissions:

- **tabs**: Manage browser tabs
- **activeTab**: Access current active tab
- **scripting**: Inject scripts into web pages
- **storage**: Store extension settings
- **bookmarks**: Manage browser bookmarks
- **tts**: Text-to-speech functionality
- **host_permissions**: Access all URLs for navigation

## Browser Compatibility

- **Chrome**: Version 88+ (Manifest V3 support)
- **Edge**: Version 88+ (Chromium-based)
- **Opera**: Version 74+ (Chromium-based)

**Note**: Speech recognition requires an active internet connection and may vary by browser and operating system.

## Troubleshooting

### Voice Recognition Not Working

1. Check microphone permissions in Chrome settings
2. Ensure you have an active internet connection
3. Try refreshing the page and restarting voice control
4. Check browser console for error messages

### Commands Not Executing

1. Ensure the extension has necessary permissions
2. Check that you're on a supported website
3. Verify the command syntax matches the examples
4. Check browser console for error messages

### Extension Not Loading

1. Verify you're using Chrome 88 or later
2. Check that all files are present in the extension folder
3. Review the browser console for manifest errors
4. Try reloading the extension

## Development

### Building from Source

1. Clone the repository
2. No build process required - pure JavaScript
3. Load as unpacked extension in Chrome

### Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is developed for academic purposes as part of Software Project Management coursework.

## Author

Uzair Hassan 48525
Daniyal Wajid 48528

Semester: Fall 2025  
University: Riphah International University  
Riphah School of Computing & Innovation – Lahore Campus

## Acknowledgments

- Web Speech API documentation
- Chrome Extension API documentation
- IEEE 1058-1998 Software Project Management standards
