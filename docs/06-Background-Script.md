# Background Script (Service Worker)

**Navigation:** [← Network Rules](05-Net-Rules-Explained.md) | [Overview](00-Overview.md) | [Next: Sidebar UI →](07-Sidebar-UI.md)

---

## What is background.js?

Our **background script** (also called a **service worker** in Manifest V3) is JavaScript code that runs in the background, handling events and performing tasks even when the extension UI isn't visible.

**File:** `background.js` (42 lines)

**Purpose:**

1. Configure side panel behavior on installation
2. Clear cache and service workers (nuclear reset)
3. Handle keyboard shortcut (Ctrl+Space)

---

## Complete Code with Annotations

```javascript
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

chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-vantage-panel") {
    chrome.windows.getCurrent((window) => {
      chrome.sidePanel.open({ windowId: window.id }).catch((err) => {
        console.error("Side panel toggle error:", err);
      });
    });
  }
});
```

---

## Part 1: Installation Event

### What is chrome.runtime.onInstalled?

An **event listener** that fires when:

1. **Extension is first installed**
2. **Extension is updated to a new version**
3. **Chrome browser is updated**

```javascript
chrome.runtime.onInstalled.addListener(() => {
  // This code runs once on installation/update
});
```

### Checking Install Reason

You can differentiate between install and update:

```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("First install!");
  } else if (details.reason === "update") {
    console.log(
      "Updated from",
      details.previousVersion,
      "to",
      chrome.runtime.getManifest().version,
    );
  }
});
```

**Our code:** We run the same logic for both install and update.

---

## Part 2: Side Panel Configuration

### Setting Panel Behavior

```javascript
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((error) => console.error("Error setting panel behavior:", error));
```

### What This Does

**`openPanelOnActionClick: true`**

- When user clicks the extension icon → side panel opens
- Without this, clicking the icon would do nothing

**Alternative behaviors:**

- `false` - Clicking icon does nothing (must use keyboard shortcut or programmatic open)

### Error Handling

```javascript
.catch((error) => console.error("Error setting panel behavior:", error));
```

**Why catch errors?**

- `setPanelBehavior` is a Promise
- Might fail if Side Panel API isn't supported (older Chrome versions)
- Better to log error than crash silently

### Chrome.sidePanel API

**Available methods:**

```javascript
// Open panel programmatically
chrome.sidePanel.open({ windowId: window.id });

// Set which HTML to show
chrome.sidePanel.setOptions({ path: "index.html" });

// Get current panel state
chrome.sidePanel.getOptions({ windowId: window.id });
```

**Browser support:**

- Chrome 114+ (June 2023)
- Edge 114+

---

## Part 3: Nuclear Reset (Cache Clearing)

### The Problem

**Why we need this:**
When a website sets security headers (CSP, X-Frame-Options), browsers **cache** them. Even after we install our extension and strip those headers, cached versions might persist.

**Symptoms without nuclear reset:**

- First load after install → CSP violation (uses cached headers)
- Reload → Works (uses our modified headers)

**Solution:** Clear cache and service workers on installation.

---

### The Code

```javascript
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
    cookies: false,
  },
);
```

---

### Target Origins

**Format:** Must include protocol (`https://`) and can use wildcards (`*`).

**Examples:**

- `"https://chatgpt.com"` - Exact domain
- `"https://*.chatgpt.com"` - All subdomains (auth.chatgpt.com, etc.)
- `"https://*.google.com"` - All Google subdomains

**Why wildcards?**
AI services often use subdomains for auth, APIs, CDNs, etc.

**Why so many Google domains?**
Gemini uses:

- `gemini.google.com` - Main chat
- `accounts.google.com` - Login
- `*.google.com` - Various Google services
- `*.googleusercontent.com` - User-uploaded content, profile pics

---

### What Gets Cleared

```javascript
{
  cache: true,           // HTTP cache
  serviceWorkers: true,  // Service Worker registrations
  history: false,        // Browsing history
  cookies: false,        // Cookies
}
```

#### cache: true

Clears HTTP cache (HTML, CSS, JS, images cached by the browser).

**Why?**
Cached CSP headers can persist and block iframes.

#### serviceWorkers: true

Unregisters service workers for these domains.

**Why?**
Service workers can:

- Cache responses (including CSP headers)
- Intercept network requests
- Override our header modifications

#### history: false

**Don't** clear browsing history.

**Why?**

- Not necessary for our use case
- Users might want to keep their chat history
- Could be seen as invasive

#### cookies: false

**Don't** clear cookies.

**Why?**

- Users would be logged out of ChatGPT, Gemini, etc.
- Extremely annoying user experience
- Cookies are necessary for functionality

---

### Alternative: Clear Everything

If we didn't care about user convenience:

```javascript
chrome.browsingData.remove(
  { origins: targets },
  {
    cache: true,
    serviceWorkers: true,
    history: true, // ❌ Invasive
    cookies: true, // ❌ Logs users out
    localStorage: true, // ❌ Loses preferences
    indexedDB: true, // ❌ Loses chat history
    formData: true, // ❌ Loses autofill
    passwords: true, // ❌ Logs users out
  },
);
```

**Our philosophy:** Minimal disruption. Only clear what's necessary.

---

### Timing

**When does this run?**

- On extension **first install**
- On extension **update**

**Why on update?**
Sites might have changed their CSP policies. Clearing cache ensures we start fresh.

---

## Part 4: Keyboard Shortcut Handler

### The Code

```javascript
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-vantage-panel") {
    chrome.windows.getCurrent((window) => {
      chrome.sidePanel.open({ windowId: window.id }).catch((err) => {
        console.error("Side panel toggle error:", err);
      });
    });
  }
});
```

---

### Event Listener

```javascript
chrome.commands.onCommand.addListener((command) => {
  // Fires when user presses a registered keyboard shortcut
});
```

**Registered shortcuts:**
Defined in `manifest.json`:

```json
"commands": {
  "toggle-vantage-panel": {
    "suggested_key": {
      "default": "Ctrl+Space",
      "mac": "Command+Space"
    },
    "description": "Open Vantage AI Sidebar"
  }
}
```

---

### Command Detection

```javascript
if (command === "toggle-vantage-panel") {
  // User pressed Ctrl+Space (or Cmd+Space on Mac)
}
```

**Why check the command name?**
Extensions can have multiple keyboard shortcuts. The `command` parameter tells us which one was pressed.

---

### Opening the Side Panel

```javascript
chrome.windows.getCurrent((window) => {
  chrome.sidePanel.open({ windowId: window.id });
});
```

**Two-step process:**

#### Step 1: Get Current Window

```javascript
chrome.windows.getCurrent((window) => {
  // window.id is the ID of the active Chrome window
});
```

**Why?**
Chrome can have multiple windows open. We need to specify which window to open the panel in.

#### Step 2: Open Panel

```javascript
chrome.sidePanel.open({ windowId: window.id });
```

Opens the side panel in the specified window.

---

### Error Handling

```javascript
.catch((err) => {
  console.error("Side panel toggle error:", err);
});
```

**Possible errors:**

- Side panel already open (not actually an error)
- Window doesn't exist (user closed it between steps)
- Side Panel API not supported

**Best practice:** Always log errors for debugging.

---

## Service Worker Lifecycle

### Key Differences from Background Pages (Manifest V2)

| Background Page (V2)       | Service Worker (V3)      |
| -------------------------- | ------------------------ |
| Always running             | Event-driven             |
| Persistent state in memory | No persistent state      |
| Can use DOM APIs           | No DOM, no window object |
| Load HTML page             | JavaScript only          |

### Event-Driven Execution

Service workers **sleep** when idle and **wake up** when events occur.

**Wakes up for:**

- Extension installation/update
- Browser startup (if `chrome.runtime.onStartup` is registered)
- Keyboard shortcuts
- Messages from content scripts
- Network requests (if using webRequest API)
- Alarms (if using chrome.alarms API)

**Sleeps after:**

- 30 seconds of inactivity
- No pending events

---

### State Persistence

**Problem:** Variables don't persist between wake/sleep cycles.

```javascript
// ❌ BAD: This won't persist
let userPreference = "ChatGPT";

chrome.runtime.onInstalled.addListener(() => {
  userPreference = "Claude";
});

// Later, when service worker wakes up:
console.log(userPreference); // Undefined! Service worker restarted
```

**Solution:** Use `chrome.storage`

```javascript
// ✅ GOOD: Persists across restarts
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ userPreference: "Claude" });
});

// Later:
chrome.storage.local.get(["userPreference"], (result) => {
  console.log(result.userPreference); // 'Claude'
});
```

---

### What You CAN'T Do in Service Workers

#### No DOM

```javascript
// ❌ NOT ALLOWED
document.getElementById("foo");
window.location.href;
alert("Hello");
```

#### No localStorage

```javascript
// ❌ NOT ALLOWED
localStorage.setItem("key", "value");
```

Use `chrome.storage` instead.

#### No XMLHttpRequest (Legacy)

```javascript
// ❌ NOT ALLOWED
const xhr = new XMLHttpRequest();
```

Use `fetch()` instead:

```javascript
// ✅ ALLOWED
const response = await fetch("https://api.example.com/data");
```

---

## Debugging background.js

### View Console Logs

1. Go to `chrome://extensions/`
2. Find **Vantage LLM**
3. Click **"Service worker"** (or "Inspect views: service worker")
4. DevTools opens → Console tab shows logs

### Check if Service Worker is Running

**Active:**

```
Service worker (active)
```

Extension is running.

**Inactive:**

```
Service worker (inactive)
```

Extension is asleep. Will wake up when needed.

### Manually Trigger Events

In the DevTools console (for the service worker):

```javascript
// Simulate installation
chrome.runtime.onInstalled.dispatch({ reason: "install" });

// Simulate command
chrome.commands.onCommand.dispatch("toggle-vantage-panel");
```

**Note:** This works for testing, but real events come from browser actions.

---

## Best Practices

### 1. Keep It Lightweight

Service workers should be fast and minimal.

❌ **Don't:**

```javascript
chrome.runtime.onInstalled.addListener(() => {
  // Expensive operation
  for (let i = 0; i < 1000000; i++) {
    doSomething();
  }
});
```

✅ **Do:**

```javascript
chrome.runtime.onInstalled.addListener(() => {
  // Quick, simple configuration
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});
```

### 2. Use Promises/Async Await

Modern Chrome APIs return Promises.

❌ **Old way (callbacks):**

```javascript
chrome.windows.getCurrent(function (window) {
  chrome.sidePanel.open({ windowId: window.id });
});
```

✅ **Modern way (async/await):**

```javascript
chrome.commands.onCommand.addListener(async (command) => {
  if (command === "toggle-vantage-panel") {
    const window = await chrome.windows.getCurrent();
    await chrome.sidePanel.open({ windowId: window.id });
  }
});
```

### 3. Handle Errors Gracefully

Always catch errors in Promises.

❌ **Don't:**

```javascript
chrome.sidePanel.open({ windowId: 123 }); // Might fail silently
```

✅ **Do:**

```javascript
chrome.sidePanel
  .open({ windowId: 123 })
  .catch((err) => console.error("Failed to open panel:", err));
```

### 4. Minimize Global State

Service workers restart frequently. Don't rely on global variables.

❌ **Don't:**

```javascript
let counter = 0;
chrome.runtime.onMessage.addListener(() => {
  counter++; // Resets to 0 when service worker restarts
});
```

✅ **Do:**

```javascript
chrome.runtime.onMessage.addListener(async () => {
  const { counter = 0 } = await chrome.storage.local.get("counter");
  await chrome.storage.local.set({ counter: counter + 1 });
});
```

---

## Alternative Approaches

### What if We Didn't Have a Background Script?

**We could:**

- Remove `background.js`
- Remove `"background"` from `manifest.json`

**Consequences:**

1. **No auto-open on icon click**
   - User would have to right-click icon → "Open side panel"
   - Bad UX

2. **No keyboard shortcut**
   - Shortcuts require a background script to handle the event

3. **No nuclear reset**
   - First load after install might fail due to cached CSP
   - User would manually need to clear cache

**Conclusion:** Background script is essential for good UX.

---

## Extending background.js

### Example: Welcome Page on First Install

```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    // Show welcome page on first install
    chrome.tabs.create({ url: "https://vantage.example.com/welcome" });
  }
});
```

### Example: Periodic Cache Clearing

```javascript
// Clear cache every 7 days
chrome.alarms.create("clearCache", { periodInMinutes: 60 * 24 * 7 });

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "clearCache") {
    chrome.browsingData.remove(/* ... */);
  }
});
```

### Example: Right-Click Context Menu

```javascript
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "openVantage",
    title: "Open with Vantage AI",
    contexts: ["selection"],
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "openVantage") {
    const selectedText = info.selectionText;
    // Open panel and send selected text to LLM
  }
});
```

---

## Further Reading

- [Service Workers in Extensions](https://developer.chrome.com/docs/extensions/mv3/service_workers/)
- [chrome.sidePanel API](https://developer.chrome.com/docs/extensions/reference/sidePanel/)
- [chrome.browsingData API](https://developer.chrome.com/docs/extensions/reference/browsingData/)
- [chrome.commands API](https://developer.chrome.com/docs/extensions/reference/commands/)

---

## Next Steps

**→ Continue to [Sidebar UI Architecture](07-Sidebar-UI.md)**

Or explore other components:

- [Troubleshooting Guide](08-Troubleshooting.md)
- [Publishing Guide](09-Publishing-Guide.md)

---

_Last Updated: February 6, 2026_
