// Set side panel behavior
chrome.runtime.onInstalled.addListener(() => {
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true })
        .catch((error) => console.error("Error setting panel behavior:", error));

    console.log("OmniChat: Clearing cache to apply new security rules...");
    chrome.browsingData.remove({
        "origins": [
            "https://chatgpt.com",
            "https://gemini.google.com",
            "https://www.perplexity.ai",
            "https://copilot.microsoft.com",
            "https://www.bing.com",
            "https://login.microsoftonline.com"
        ]
    }, { "cache": true, "cookies": false });
});

chrome.commands.onCommand.addListener((command) => {
    console.log("Service Worker: Received command:", command);
    if (command === "toggle-sidebar-alt" || command === "_execute_action") {
        chrome.windows.getCurrent((window) => {
            chrome.sidePanel.open({ windowId: window.id }).catch((err) => {
                console.error("Service Worker: Side panel toggle error:", err);
            });
        });
    }
});

chrome.action.onClicked.addListener((tab) => {
    console.log("Service Worker: Action clicked for tab:", tab.id);
    chrome.sidePanel.open({ windowId: tab.windowId })
        .catch((err) => console.error("Service Worker: Side panel open FAIL:", err));
});
