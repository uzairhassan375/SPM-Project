// Voice Engine module for Voice Agent Chrome Extension
// Handles speech recognition and text-to-speech functionality

class VoiceEngine {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.onResultCallback = null;
        this.onErrorCallback = null;
        this.isListening = false;
        
        this.initializeRecognition();
    }
    
    // Initialize Web Speech API recognition
    initializeRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            console.error('Speech recognition not supported');
            return; // Don't throw, just return
        }
        
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
        } catch (error) {
            console.error('Error creating SpeechRecognition:', error);
            return;
        }
        
        // Configure recognition settings
        this.recognition.continuous = true;
        this.recognition.interimResults = false;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 1;
        
        // Set up event handlers
        this.recognition.onresult = (event) => {
            const transcript = event.results[event.results.length - 1][0].transcript.trim();
            if (this.onResultCallback) {
                this.onResultCallback(transcript);
            }
        };
        
        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            if (this.onErrorCallback) {
                this.onErrorCallback(event.error);
            }
            
            // Restart on certain errors
            if (event.error === 'no-speech' || event.error === 'audio-capture') {
                if (this.isListening) {
                    setTimeout(() => {
                        if (this.isListening) {
                            this.recognition.start();
                        }
                    }, 1000);
                }
            }
        };
        
        this.recognition.onend = () => {
            // Auto-restart if still listening
            if (this.isListening) {
                setTimeout(() => {
                    if (this.isListening) {
                        this.recognition.start();
                    }
                }, 100);
            }
        };
    }
    
    // Start voice recognition
    start() {
        if (!this.recognition) {
            console.error('Recognition not initialized');
            return false;
        }
        
        if (!this.isListening) {
            try {
                this.recognition.start();
                this.isListening = true;
                console.log('Voice recognition started');
                return true;
            } catch (error) {
                console.error('Error starting recognition:', error);
                // Check if it's already started
                if (error.message && error.message.includes('already started')) {
                    this.isListening = true;
                    return true;
                }
                return false;
            }
        }
        return true;
    }
    
    // Stop voice recognition
    stop() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
            console.log('Voice recognition stopped');
        }
    }
    
    // Set callback for recognition results
    onResult(callback) {
        this.onResultCallback = callback;
    }
    
    // Set callback for recognition errors
    onError(callback) {
        this.onErrorCallback = callback;
    }
    
    // Speak text using text-to-speech
    speak(text, options = {}) {
        if (!this.synthesis) {
            console.warn('Speech synthesis not available');
            return;
        }
        
        // Cancel any ongoing speech
        this.synthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = options.lang || 'en-US';
        utterance.rate = options.rate || 1.0;
        utterance.pitch = options.pitch || 1.0;
        utterance.volume = options.volume || 1.0;
        
        utterance.onerror = (event) => {
            console.error('Speech synthesis error:', event.error);
        };
        
        this.synthesis.speak(utterance);
    }
    
    // Stop speaking
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }
    
    // Check if currently listening
    getListeningState() {
        return this.isListening;
    }
}
