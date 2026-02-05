chrome.commands.onCommand.addListener((command) => {
    if (command === "toggle-sidebar") {
        // sidePanel.open requires a windowId or tabId. We'll use the current window.
        chrome.windows.getCurrent((window) => {
            chrome.sidePanel.open({ windowId: window.id }).catch((err) => {
                console.error("Side panel open error:", err);
            });
        });
    }
});

// Also handle the case where the user clicks the extension icon
chrome.action.onClicked.addListener((tab) => {
    chrome.sidePanel.open({ windowId: tab.windowId });
});
