// Side Panel Behavior: Toggle on click
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error("Error setting panel behavior:", error));

    console.log("OmniChat: Performing Nuclear Reset (Clearing Service Workers & Cache)...");

    // CLEAR EVERYTHING that can interfere with DNR rules
    chrome.browsingData.remove({
        "origins": [
            "https://chatgpt.com",
            "https://gemini.google.com",
            "https://www.perplexity.ai",
            "https://copilot.microsoft.com",
            "https://www.bing.com",
            "https://login.microsoftonline.com",
            "https://www.microsoft.com"
        ]
    }, {
        "cache": true,
        "serviceWorkers": true,
        "indexedDB": true,
        "localStorage": false // Keep their login session
    });
});

chrome.commands.onCommand.addListener((command) => {
    console.log("Service Worker: Command triggered:", command);
    if (command === "toggle-sidebar-alt" || command === "_execute_action") {
        chrome.windows.getCurrent((window) => {
            chrome.sidePanel.open({ windowId: window.id }).catch((err) => {
                console.error("Service Worker: Open error:", err);
            });
        });
    }
});
