// Popup script for Voice Agent Chrome Extension
// Handles UI interactions and communication with background script

let isListening = false;
let recognition = null;

// Initialize popup
document.addEventListener('DOMContentLoaded', () => {
    const startBtn = document.getElementById('startBtn');
    const stopBtn = document.getElementById('stopBtn');
    const statusIndicator = document.getElementById('status-indicator');
    const statusText = document.getElementById('status-text');
    
    // Check current state from storage
    chrome.storage.local.get(['isListening'], (result) => {
        if (result.isListening) {
            isListening = true;
            updateUI(true);
        }
    });
    
    // Start button click handler
    startBtn.addEventListener('click', async () => {
        try {
            // Get current active tab
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            // Check if it's a restricted page where we can't inject scripts
            if (!tab.url) {
                showError('Unable to get tab URL. Please try again.');
                return;
            }
            
            // Only block chrome:// internal pages (where we definitely can't inject)
            // Allow http://, https://, file://, and other protocols
            if (tab.url.startsWith('chrome://') || tab.url.startsWith('chrome-search://') || tab.url.startsWith('edge://')) {
                showError('Voice control cannot be used on Chrome internal pages. Please navigate to a regular website (http:// or https://).');
                return;
            }
            
            // Note: chrome-extension:// pages might work, but we'll try anyway
            
            // Try to send message first (content script might already be loaded)
            chrome.tabs.sendMessage(tab.id, { action: 'startListening' }, (response) => {
                if (chrome.runtime.lastError) {
                    // Content script not loaded, try to inject it
                    console.log('Content script not loaded, injecting...');
                    chrome.scripting.executeScript({
                        target: { tabId: tab.id },
                        files: ['voiceEngine.js', 'intentParser.js', 'commandExecutor.js', 'contentScript.js']
                    }).then(() => {
                        // Wait a bit for scripts to load, then send message
                        setTimeout(() => {
                            chrome.tabs.sendMessage(tab.id, { action: 'startListening' }, (response) => {
                                if (chrome.runtime.lastError) {
                                    console.error('Error:', chrome.runtime.lastError);
                                    const errorMsg = chrome.runtime.lastError.message || 'Unknown error';
                                    if (errorMsg.includes('Cannot access') || errorMsg.includes('chrome://')) {
                                        showError('Cannot access this page. Please navigate to a regular website (http:// or https://).');
                                    } else {
                                        showError('Failed to start voice control. Please refresh the page and try again.');
                                    }
                                    return;
                                }
                                
                                if (response && response.success) {
                                    isListening = true;
                                    chrome.storage.local.set({ isListening: true });
                                    updateUI(true);
                                } else {
                                    showError('Failed to start voice control. Please check microphone permissions.');
                                }
                            });
                        }, 500);
                    }).catch(error => {
                        console.error('Error injecting script:', error);
                        if (error.message && error.message.includes('Cannot access')) {
                            showError('Cannot inject scripts on this page. Please navigate to a regular website (http:// or https://).');
                        } else {
                            showError('Failed to inject content script: ' + error.message);
                        }
                    });
                    return;
                }
                
                if (response && response.success) {
                    isListening = true;
                    chrome.storage.local.set({ isListening: true });
                    updateUI(true);
                } else {
                    showError('Failed to start voice control. Please check microphone permissions.');
                }
            });
        } catch (error) {
            console.error('Error starting voice control:', error);
            showError('Failed to start voice control: ' + error.message);
        }
    });
    
    // Stop button click handler
    stopBtn.addEventListener('click', async () => {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            
            chrome.tabs.sendMessage(tab.id, { action: 'stopListening' }, (response) => {
                isListening = false;
                chrome.storage.local.set({ isListening: false });
                updateUI(false);
            });
        } catch (error) {
            console.error('Error stopping voice control:', error);
        }
    });
    
    // Listen for messages from content script
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'transcript') {
            addTranscript(message.text, message.isError);
        } else if (message.type === 'status') {
            updateUI(message.isListening);
        }
    });
    
    // Update UI based on listening state
    function updateUI(listening) {
        if (listening) {
            statusIndicator.classList.remove('inactive');
            statusIndicator.classList.add('active');
            statusText.textContent = 'Listening...';
            startBtn.disabled = true;
            stopBtn.disabled = false;
        } else {
            statusIndicator.classList.remove('active');
            statusIndicator.classList.add('inactive');
            statusText.textContent = 'Inactive';
            startBtn.disabled = false;
            stopBtn.disabled = true;
        }
    }
    
    // Add transcript to UI
    function addTranscript(text, isError = false) {
        const transcriptDiv = document.getElementById('transcript');
        const item = document.createElement('div');
        item.className = `transcript-item ${isError ? 'error' : ''}`;
        item.textContent = text;
        transcriptDiv.appendChild(item);
        transcriptDiv.scrollTop = transcriptDiv.scrollHeight;
        
        // Keep only last 10 items
        const items = transcriptDiv.querySelectorAll('.transcript-item');
        if (items.length > 10) {
            items[0].remove();
        }
    }
    
    // Show error message
    function showError(message) {
        addTranscript(`Error: ${message}`, true);
    }
});
