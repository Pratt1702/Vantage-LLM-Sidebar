// Side Panel Behavior: Toggle on click
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error("Error setting panel behavior:", error));

    console.log("OmniChat: Performing Nuclear Reset (Clearing Service Workers & Cache)...");

    // Clear all subdomains as well to ensure Service Workers are killed
    const targets = [
        "https://chatgpt.com",
        "https://gemini.google.com",
        "https://claude.ai",
        "https://anthropic.com",
        "https://www.perplexity.ai",
        "https://copilot.microsoft.com",
        "https://www.bing.com",
        "https://login.microsoftonline.com",
        "https://www.microsoft.com",
        "https://microsoftonline.com"
    ];

    chrome.browsingData.remove({
        "origins": targets
    }, {
        "cache": true,
        "serviceWorkers": true,
        "indexedDB": true
    }, () => {
        console.log("OmniChat: Reset Complete.");
    });
});

chrome.commands.onCommand.addListener((command) => {
    console.log("Service Worker: Command triggered:", command);
    if (command === "_execute_action") {
        chrome.windows.getCurrent((window) => {
            chrome.sidePanel.open({ windowId: window.id }).catch((err) => {
                console.error("Service Worker: Open error:", err);
            });
        });
    }
});
