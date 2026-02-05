// Side Panel Behavior: Toggle on click
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error("Error setting panel behavior:", error));

    // Nuclear Reset (Clearing Service Workers & Cache)
    const targets = [
        "https://chatgpt.com",
        "https://*.chatgpt.com",
        "https://gemini.google.com",
        "https://claude.ai",
        "https://anthropic.com",
        "https://www.perplexity.ai",
        "https://*.google.com",
        "https://*.googleusercontent.com",
        "https://*.bing.com"
    ];

    chrome.browsingData.remove({
        "origins": targets
    }, {
        "cache": true,
        "serviceWorkers": true,
        "history": false,
        "cookies": false // Keep cookies so they stay logged in
    });
});

chrome.commands.onCommand.addListener((command) => {
    if (command === "_execute_action") {
        chrome.windows.getCurrent((window) => {
            chrome.sidePanel.open({ windowId: window.id }).catch((err) => {
                console.error("Side panel toggle error:", err);
            });
        });
    }
});
