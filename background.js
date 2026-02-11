// Side Panel Behavior: Toggle on click
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
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
    "https://accounts.google.com",
    "https://google.com",
    "https://*.googleusercontent.com",
    "https://*.bing.com",
  ];

  chrome.browsingData.remove(
    {
      origins: targets,
    },
    {
      cache: true,
      serviceWorkers: true,
      history: false,
      cookies: false, // Keep cookies so they stay logged in
    },
  );
});

// Track sidebar state per window
const sidebarState = new Map();

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-vantage-panel") {
    chrome.windows.getCurrent((window) => {
      const windowId = window.id;
      const isOpen = sidebarState.get(windowId) || false;

      if (isOpen) {
        // Close the sidebar
        chrome.sidePanel
          .setOptions({
            windowId: windowId,
            enabled: false,
          })
          .then(() => {
            sidebarState.set(windowId, false);
            // Re-enable it immediately so it can be opened again
            chrome.sidePanel.setOptions({
              windowId: windowId,
              enabled: true,
            });
          })
          .catch((err) => {
            console.error("Side panel close error:", err);
          });
      } else {
        // Open the sidebar
        chrome.sidePanel
          .open({ windowId: windowId })
          .then(() => {
            sidebarState.set(windowId, true);
          })
          .catch((err) => {
            console.error("Side panel open error:", err);
          });
      }
    });
  }
});

// Clean up state when windows are closed
chrome.windows.onRemoved.addListener((windowId) => {
  sidebarState.delete(windowId);
});
