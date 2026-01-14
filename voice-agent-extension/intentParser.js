// Intent Parser module for Voice Agent Chrome Extension
// Parses natural language voice commands into structured intents

class IntentParser {
    constructor() {
        // Define command patterns and keywords
        this.patterns = {
            // Tab management
            openTab: {
                keywords: ['open', 'new tab', 'create tab', 'launch'],
                urlPattern: /(?:open|new tab|create tab|launch)\s+(?:a\s+)?(?:new\s+)?(?:tab\s+)?(?:for\s+)?(.+)/i
            },
            closeTab: {
                keywords: ['close tab', 'close this tab', 'close current tab'],
                pattern: /close\s+(?:this\s+)?(?:current\s+)?tab/i
            },
            switchTab: {
                keywords: ['switch tab', 'next tab', 'previous tab', 'change tab'],
                nextPattern: /(?:switch\s+to\s+)?(?:next|right)\s+tab/i,
                previousPattern: /(?:switch\s+to\s+)?(?:previous|prev|left)\s+tab/i
            },
            reloadTab: {
                keywords: ['reload', 'refresh', 'reload tab', 'refresh page'],
                pattern: /(?:reload|refresh)(?:\s+(?:this\s+)?(?:tab|page))?/i
            },
            
            // Navigation
            navigate: {
                keywords: ['go to', 'navigate to', 'visit', 'open'],
                pattern: /(?:go\s+to|navigate\s+to|visit|open)\s+(.+)/i
            },
            
            // Search
            search: {
                keywords: ['search', 'search for', 'google', 'youtube'],
                googlePattern: /(?:search\s+(?:for\s+)?|google\s+)(.+)/i,
                youtubePattern: /(?:youtube|search\s+youtube\s+for)\s+(.+)/i
            },
            
            // Page actions
            scroll: {
                keywords: ['scroll', 'scroll down', 'scroll up'],
                downPattern: /scroll\s+(?:down|bottom)/i,
                upPattern: /scroll\s+(?:up|top)/i
            },
            click: {
                keywords: ['click', 'press', 'select'],
                pattern: /(?:click|press|select)\s+(?:on\s+)?(?:the\s+)?(.+)/i
            },
            fill: {
                keywords: ['fill', 'type', 'enter', 'input'],
                pattern: /(?:fill|type|enter|input)\s+(?:in\s+)?(?:the\s+)?(.+?)\s+(?:with|as)\s+(.+)/i
            },
            
            // Bookmarks
            bookmark: {
                keywords: ['bookmark', 'save bookmark', 'add bookmark'],
                addPattern: /(?:add|save|create)\s+(?:a\s+)?bookmark/i,
                removePattern: /(?:remove|delete)\s+(?:this\s+)?bookmark/i
            },
            
            // Window management
            window: {
                keywords: ['minimize', 'maximize', 'minimize window', 'maximize window'],
                minimizePattern: /minimize\s+(?:window|browser)?/i,
                maximizePattern: /maximize\s+(?:window|browser)?/i
            }
        };
    }
    
    // Parse voice command into intent
    parse(transcript) {
        const normalized = transcript.toLowerCase().trim();
        
        // Try to match each command pattern
        for (const [command, config] of Object.entries(this.patterns)) {
            const intent = this.matchPattern(normalized, command, config);
            if (intent) {
                return intent;
            }
        }
        
        return null; // No match found
    }
    
    // Match transcript against pattern
    matchPattern(transcript, command, config) {
        switch (command) {
            case 'openTab':
                const urlMatch = transcript.match(config.urlPattern);
                if (urlMatch) {
                    const url = this.normalizeUrl(urlMatch[1]);
                    return {
                        command: 'openTab',
                        params: { url }
                    };
                }
                break;
            
            case 'closeTab':
                if (config.pattern.test(transcript)) {
                    return { command: 'closeTab', params: {} };
                }
                break;
            
            case 'switchTab':
                if (config.nextPattern.test(transcript)) {
                    return { command: 'switchTab', params: { direction: 'next' } };
                } else if (config.previousPattern.test(transcript)) {
                    return { command: 'switchTab', params: { direction: 'previous' } };
                }
                break;
            
            case 'reloadTab':
                if (config.pattern.test(transcript)) {
                    return { command: 'reloadTab', params: {} };
                }
                break;
            
            case 'navigate':
                const navMatch = transcript.match(config.pattern);
                if (navMatch) {
                    const url = this.normalizeUrl(navMatch[1]);
                    return {
                        command: 'navigate',
                        params: { url }
                    };
                }
                break;
            
            case 'search':
                const youtubeMatch = transcript.match(config.youtubePattern);
                if (youtubeMatch) {
                    return {
                        command: 'search',
                        params: { query: youtubeMatch[1].trim(), engine: 'youtube' }
                    };
                }
                
                const googleMatch = transcript.match(config.googlePattern);
                if (googleMatch) {
                    return {
                        command: 'search',
                        params: { query: googleMatch[1].trim(), engine: 'google' }
                    };
                }
                break;
            
            case 'scroll':
                if (config.downPattern.test(transcript)) {
                    return { command: 'scroll', params: { direction: 'down', amount: 500 } };
                } else if (config.upPattern.test(transcript)) {
                    return { command: 'scroll', params: { direction: 'up', amount: 500 } };
                }
                break;
            
            case 'click':
                const clickMatch = transcript.match(config.pattern);
                if (clickMatch) {
                    const selector = this.elementToSelector(clickMatch[1].trim());
                    return {
                        command: 'click',
                        params: { selector }
                    };
                }
                break;
            
            case 'fill':
                const fillMatch = transcript.match(config.pattern);
                if (fillMatch) {
                    const selector = this.elementToSelector(fillMatch[1].trim());
                    const value = fillMatch[2].trim();
                    return {
                        command: 'fill',
                        params: { selector, value }
                    };
                }
                break;
            
            case 'bookmark':
                if (config.addPattern.test(transcript)) {
                    return { command: 'bookmark', params: { action: 'add' } };
                } else if (config.removePattern.test(transcript)) {
                    return { command: 'bookmark', params: { action: 'remove' } };
                }
                break;
            
            case 'window':
                if (config.minimizePattern.test(transcript)) {
                    return { command: 'window', params: { action: 'minimize' } };
                } else if (config.maximizePattern.test(transcript)) {
                    return { command: 'window', params: { action: 'maximize' } };
                }
                break;
        }
        
        return null;
    }
    
    // Normalize URL from voice input
    normalizeUrl(input) {
        let url = input.trim();
        
        // Add protocol if missing
        if (!url.match(/^https?:\/\//i)) {
            url = 'https://' + url;
        }
        
        // Handle common website names
        const commonSites = {
            'google': 'https://www.google.com',
            'youtube': 'https://www.youtube.com',
            'facebook': 'https://www.facebook.com',
            'twitter': 'https://www.twitter.com',
            'github': 'https://www.github.com',
            'gmail': 'https://mail.google.com'
        };
        
        const siteName = url.replace(/^https?:\/\/(www\.)?/i, '').split('/')[0].toLowerCase();
        if (commonSites[siteName]) {
            return commonSites[siteName];
        }
        
        return url;
    }
    
    // Convert element description to CSS selector
    elementToSelector(description) {
        // Try common selectors
        const lowerDesc = description.toLowerCase();
        
        // Button selectors
        if (lowerDesc.includes('button')) {
            const buttonText = description.replace(/button/gi, '').trim();
            if (buttonText) {
                return `button:contains("${buttonText}"), [aria-label*="${buttonText}"], button[title*="${buttonText}"]`;
            }
            return 'button';
        }
        
        // Link selectors
        if (lowerDesc.includes('link')) {
            const linkText = description.replace(/link/gi, '').trim();
            if (linkText) {
                return `a:contains("${linkText}"), a[aria-label*="${linkText}"]`;
            }
            return 'a';
        }
        
        // Input selectors
        if (lowerDesc.includes('input') || lowerDesc.includes('field') || lowerDesc.includes('box')) {
            const fieldName = description.replace(/(input|field|box)/gi, '').trim();
            if (fieldName) {
                return `input[name*="${fieldName}"], input[placeholder*="${fieldName}"], input[aria-label*="${fieldName}"]`;
            }
            return 'input';
        }
        
        // Generic selector
        return description;
    }
}
