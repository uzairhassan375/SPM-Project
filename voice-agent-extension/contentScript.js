// Content script for Voice Agent Chrome Extension
// Handles voice recognition and command execution on web pages

let voiceEngine = null;
let intentParser = null;
let commandExecutor = null;
let isListening = false;

// Initialize components
function initialize() {
    if (!voiceEngine) {
        try {
            voiceEngine = new VoiceEngine();
            intentParser = new IntentParser();
            commandExecutor = new CommandExecutor();
            
            // Set up event listeners
            voiceEngine.onResult((transcript) => {
                handleVoiceInput(transcript);
            });
            
            voiceEngine.onError((error) => {
                console.error('Voice recognition error:', error);
                sendMessage({ type: 'transcript', text: `Error: ${error}`, isError: true });
            });
        } catch (error) {
            console.error('Error initializing voice engine:', error);
            sendMessage({ 
                type: 'transcript', 
                text: `Initialization error: ${error.message}`, 
                isError: true 
            });
            throw error;
        }
    }
}

// Handle voice input
function handleVoiceInput(transcript) {
    console.log('Voice input:', transcript);
    sendMessage({ type: 'transcript', text: `You said: ${transcript}` });
    
    // Parse intent from transcript
    const intent = intentParser.parse(transcript);
    console.log('Parsed intent:', intent);
    
    if (intent) {
        // Execute command
        commandExecutor.execute(intent)
            .then(result => {
                sendMessage({ 
                    type: 'transcript', 
                    text: `✓ ${result.message || 'Command executed'}` 
                });
                
                // Provide voice feedback
                if (result.message) {
                    voiceEngine.speak(result.message);
                }
            })
            .catch(error => {
                console.error('Command execution error:', error);
                sendMessage({ 
                    type: 'transcript', 
                    text: `✗ Error: ${error.message}`, 
                    isError: true 
                });
                voiceEngine.speak('Command failed. Please try again.');
            });
    } else {
        sendMessage({ 
            type: 'transcript', 
            text: 'Command not recognized. Please try again.', 
            isError: true 
        });
        voiceEngine.speak('Command not recognized. Please try again.');
    }
}

// Start listening
function startListening() {
    if (!isListening) {
        try {
            initialize();
            
            // Check if speech recognition is available
            if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
                sendMessage({ 
                    type: 'transcript', 
                    text: 'Speech recognition is not supported in this browser.', 
                    isError: true 
                });
                return;
            }
            
            voiceEngine.start();
            isListening = true;
            sendMessage({ type: 'status', isListening: true });
            sendMessage({ type: 'transcript', text: 'Voice control started. Listening...' });
            console.log('Voice recognition started');
        } catch (error) {
            console.error('Error starting voice recognition:', error);
            sendMessage({ 
                type: 'transcript', 
                text: `Failed to start: ${error.message}`, 
                isError: true 
            });
            isListening = false;
        }
    }
}

// Stop listening
function stopListening() {
    if (isListening && voiceEngine) {
        voiceEngine.stop();
        isListening = false;
        sendMessage({ type: 'status', isListening: false });
        console.log('Voice recognition stopped');
    }
}

// Send message to popup
function sendMessage(message) {
    chrome.runtime.sendMessage(message).catch(err => {
        console.error('Error sending message:', err);
    });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'startListening') {
        try {
            startListening();
            sendResponse({ success: true });
        } catch (error) {
            console.error('Error in startListening handler:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true; // Keep channel open for async response
    } else if (message.action === 'stopListening') {
        try {
            stopListening();
            sendResponse({ success: true });
        } catch (error) {
            console.error('Error in stopListening handler:', error);
            sendResponse({ success: false, error: error.message });
        }
        return true;
    }
    return false;
});

// Check if already listening (from storage)
chrome.storage.local.get(['isListening'], (result) => {
    if (result.isListening) {
        startListening();
    }
});
