// Command Executor module for Voice Agent Chrome Extension
// Executes parsed intents by communicating with background script

class CommandExecutor {
    constructor() {
        this.runtime = chrome.runtime;
    }
    
    // Execute a parsed intent
    async execute(intent) {
        try {
            // Send command to background script for execution
            const response = await this.runtime.sendMessage({
                action: 'executeCommand',
                command: intent.command,
                params: intent.params
            });
            
            if (response && response.success) {
                return {
                    success: true,
                    message: response.result?.message || 'Command executed successfully'
                };
            } else {
                throw new Error(response?.error || 'Command execution failed');
            }
        } catch (error) {
            console.error('Command execution error:', error);
            throw error;
        }
    }
    
    // Execute command with retry logic
    async executeWithRetry(intent, maxRetries = 2) {
        let lastError;
        
        for (let i = 0; i < maxRetries; i++) {
            try {
                return await this.execute(intent);
            } catch (error) {
                lastError = error;
                console.warn(`Command execution attempt ${i + 1} failed:`, error);
                
                if (i < maxRetries - 1) {
                    // Wait before retry
                    await new Promise(resolve => setTimeout(resolve, 500));
                }
            }
        }
        
        throw lastError;
    }
}
