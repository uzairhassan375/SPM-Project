// Background service worker for Voice Agent Chrome Extension
// Handles extension lifecycle and cross-tab communication

// Extension installation
chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason === 'install') {
        console.log('Voice Agent Extension installed');
        // Set default settings
        chrome.storage.local.set({
            isListening: false,
            voiceEnabled: true,
            language: 'en-US'
        });
    }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'executeCommand') {
        handleCommand(message.command, message.params, sender.tab)
            .then(result => sendResponse({ success: true, result }))
            .catch(error => sendResponse({ success: false, error: error.message }));
        return true; // Keep channel open for async response
    }
});

// Handle command execution
async function handleCommand(command, params, tab) {
    try {
        switch (command) {
            case 'openTab':
                return await openNewTab(params.url);
            
            case 'closeTab':
                return await closeTab(tab.id);
            
            case 'switchTab':
                return await switchTab(params.direction);
            
            case 'reloadTab':
                return await reloadTab(tab.id);
            
            case 'navigate':
                return await navigateToUrl(tab.id, params.url);
            
            case 'search':
                return await performSearch(params.query, params.engine);
            
            case 'scroll':
                return await scrollPage(tab.id, params.direction, params.amount);
            
            case 'click':
                return await clickElement(tab.id, params.selector);
            
            case 'fill':
                return await fillInput(tab.id, params.selector, params.value);
            
            case 'bookmark':
                return await manageBookmark(tab.id, params.action);
            
            case 'window':
                return await manageWindow(params.action);
            
            default:
                throw new Error(`Unknown command: ${command}`);
        }
    } catch (error) {
        console.error('Command execution error:', error);
        throw error;
    }
}

// Tab management functions
async function openNewTab(url) {
    const tab = await chrome.tabs.create({ url });
    return { message: `Opened new tab: ${url}`, tabId: tab.id };
}

async function closeTab(tabId) {
    await chrome.tabs.remove(tabId);
    return { message: 'Tab closed' };
}

async function switchTab(direction) {
    const tabs = await chrome.tabs.query({ currentWindow: true });
    const currentTab = tabs.find(t => t.active);
    const currentIndex = tabs.indexOf(currentTab);
    
    let newIndex;
    if (direction === 'next') {
        newIndex = (currentIndex + 1) % tabs.length;
    } else if (direction === 'previous') {
        newIndex = (currentIndex - 1 + tabs.length) % tabs.length;
    } else {
        throw new Error('Invalid direction');
    }
    
    await chrome.tabs.update(tabs[newIndex].id, { active: true });
    return { message: `Switched to ${direction} tab` };
}

async function reloadTab(tabId) {
    await chrome.tabs.reload(tabId);
    return { message: 'Tab reloaded' };
}

// Navigation functions
async function navigateToUrl(tabId, url) {
    await chrome.tabs.update(tabId, { url });
    return { message: `Navigated to ${url}` };
}

async function performSearch(query, engine = 'google') {
    let searchUrl;
    if (engine === 'youtube') {
        searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
    } else {
        searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    }
    
    const tab = await chrome.tabs.create({ url: searchUrl });
    return { message: `Searching for "${query}" on ${engine}`, tabId: tab.id };
}

// Page interaction functions
async function scrollPage(tabId, direction, amount = 500) {
    await chrome.scripting.executeScript({
        target: { tabId },
        func: (dir, amt) => {
            const scrollAmount = dir === 'down' ? amt : -amt;
            window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
        },
        args: [direction, amount]
    });
    return { message: `Scrolled ${direction}` };
}

async function clickElement(tabId, selector) {
    await chrome.scripting.executeScript({
        target: { tabId },
        func: (sel) => {
            const element = document.querySelector(sel);
            if (element) {
                element.click();
                return true;
            }
            return false;
        },
        args: [selector]
    });
    return { message: `Clicked element: ${selector}` };
}

async function fillInput(tabId, selector, value) {
    await chrome.scripting.executeScript({
        target: { tabId },
        func: (sel, val) => {
            const element = document.querySelector(sel);
            if (element) {
                element.value = val;
                element.dispatchEvent(new Event('input', { bubbles: true }));
                element.dispatchEvent(new Event('change', { bubbles: true }));
                return true;
            }
            return false;
        },
        args: [selector, value]
    });
    return { message: `Filled input: ${selector}` };
}

// Bookmark management
async function manageBookmark(tabId, action) {
    const tab = await chrome.tabs.get(tabId);
    
    if (action === 'add') {
        await chrome.bookmarks.create({
            title: tab.title,
            url: tab.url
        });
        return { message: 'Bookmark added' };
    } else if (action === 'remove') {
        const bookmarks = await chrome.bookmarks.search({ url: tab.url });
        if (bookmarks.length > 0) {
            await chrome.bookmarks.remove(bookmarks[0].id);
            return { message: 'Bookmark removed' };
        }
        throw new Error('Bookmark not found');
    }
}

// Window management
async function manageWindow(action) {
    if (action === 'minimize') {
        const window = await chrome.windows.getCurrent();
        await chrome.windows.update(window.id, { state: 'minimized' });
        return { message: 'Window minimized' };
    } else if (action === 'maximize') {
        const window = await chrome.windows.getCurrent();
        await chrome.windows.update(window.id, { state: 'maximized' });
        return { message: 'Window maximized' };
    }
}
