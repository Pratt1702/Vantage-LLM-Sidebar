# Chrome Extension Basics

**Navigation:** [← Back to Overview](00-Overview.md) | [Next: Manifest Explained →](02-Manifest-Explained.md)

---

## What is a Chrome Extension?

A **Chrome extension** is a small software program that customizes the browsing experience. Extensions enable users to tailor Chrome functionality and behavior to individual needs or preferences.

Think of it as:

- **Apps that run inside your browser**
- **Tools that modify web pages or browser behavior**
- **Programs with special permissions** that normal websites don't have

### Real-World Examples

- **AdBlock** - Removes ads from web pages
- **Grammarly** - Checks your writing on any website
- **LastPass** - Manages passwords across sites
- **Vantage LLM** - Embeds AI chatbots in a sidebar

## Extension Architecture

Chrome extensions are built using **web technologies** you already know:

- **HTML** - Structure
- **CSS** - Styling
- **JavaScript** - Logic

But extensions have **special capabilities**:

- Access to Chrome APIs (tabs, storage, networking, etc.)
- Ability to inject code into web pages
- Persistent background processes
- Cross-origin requests (normally blocked)

### Extension Components

Every extension can have these components:

#### 1. **Manifest File** (`manifest.json`)

- **The brain of the extension**
- Defines what the extension does and what it can access
- Required for all extensions
- Think of it as a configuration blueprint

```json
{
  "manifest_version": 3,
  "name": "My Extension",
  "version": "1.0.0",
  "description": "What this extension does"
}
```

#### 2. **Background Scripts (Service Workers)**

- Run in the background, even when the extension UI isn't open
- Handle events (browser startup, tab changes, etc.)
- Manage long-running tasks
- **Our usage:** Handles side panel toggling and cache clearing

```javascript
// background.js
chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed!");
});
```

#### 3. **Content Scripts**

- JavaScript that runs on web pages
- Can read and modify the DOM of pages
- Injected based on URL patterns
- **Our usage:** We DON'T use content scripts (we use iframes instead)

#### 4. **Popup / Side Panel**

- HTML pages that show when you click the extension icon
- Can be a popup or a side panel
- **Our usage:** We use the Side Panel API for our glassmorphic sidebar

#### 5. **Options Page**

- Settings page for your extension
- `chrome://extensions/?options=<extension_id>`
- **Our usage:** We don't have one (settings are in the sidebar itself)

## Manifest V2 vs Manifest V3

Chrome extensions have evolved through versions of the manifest specification.

### Manifest V2 (Legacy - Being Phased Out)

- Used `webRequest` API (blocking network requests)
- Background pages (always running)
- Broad host permissions
- **Deprecated in 2024**, will stop working soon

### Manifest V3 (Current Standard)

- Uses `declarativeNetRequest` API (non-blocking)
- Service workers (event-driven)
- More restrictive permissions
- Better performance and security
- **What we use in Vantage LLM**

### Why Manifest V3 Matters for Us

The key difference for our project:

**Manifest V2:**

```javascript
// Could intercept and modify network requests synchronously
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    // Block main thread to modify headers
    return { responseHeaders: modifiedHeaders };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "responseHeaders"],
);
```

**Manifest V3:**

```json
// Declare rules upfront in net_rules.json
{
  "id": 1,
  "action": {
    "type": "modifyHeaders",
    "responseHeaders": [...]
  },
  "condition": {
    "requestDomains": ["example.com"]
  }
}
```

**Benefits of V3 approach:**

- ✅ Doesn't block the browser's main thread
- ✅ More performant (rules are compiled by Chrome)
- ✅ More secure (declarative, not imperative)
- ❌ Less flexible (can't make runtime decisions)

## Extension Permissions

Extensions must declare what they want to access in the manifest.

### Permission Types

#### 1. **API Permissions**

Access to Chrome APIs:

```json
"permissions": [
  "sidePanel",        // Access to side panel API
  "storage",          // chrome.storage API
  "declarativeNetRequest"  // Modify network requests
]
```

#### 2. **Host Permissions**

Access to specific websites:

```json
"host_permissions": [
  "https://*.chatgpt.com/*",    // All ChatGPT pages
  "https://*.google.com/*"      // All Google domains
]
```

#### 3. **Optional Permissions**

Requested at runtime (not used in our extension):

```javascript
chrome.permissions.request({
  origins: ["https://example.com/*"],
});
```

### Why We Need Our Specific Permissions

| Permission              | Why We Need It                                  |
| ----------------------- | ----------------------------------------------- |
| `sidePanel`             | To create the native Chrome sidebar UI          |
| `declarativeNetRequest` | To strip security headers from AI websites      |
| `storage`               | To remember which LLM the user last selected    |
| `browsingData`          | To clear cache/service workers on install       |
| `host_permissions`      | To access ChatGPT, Gemini, Claude, etc. domains |

## Extension Development Workflow

### 1. **Project Structure**

```
my-extension/
├── manifest.json       # Required
├── background.js       # Service worker
├── popup.html          # UI
├── popup.js            # UI logic
├── styles.css          # Styling
└── icons/              # Images
```

### 2. **Loading Extension Locally**

1. Open Chrome
2. Go to `chrome://extensions/`
3. Enable **Developer mode** (top-right toggle)
4. Click **Load unpacked**
5. Select your extension folder

### 3. **Testing Changes**

After making code changes:

- **HTML/CSS/JS changes:** Just refresh the extension page
- **Manifest or background.js changes:** Click the reload icon on `chrome://extensions/`

### 4. **Debugging**

#### Background Script

- Go to `chrome://extensions/`
- Click "Service worker" under your extension
- Opens Chrome DevTools for the background script

#### Popup/Side Panel

- Right-click on the popup/panel
- Select "Inspect"
- Opens DevTools for the UI

#### Console Logs

```javascript
console.log("Debug message"); // Shows in DevTools
```

## Extension APIs We Use

### 1. **chrome.sidePanel**

Controls the side panel behavior.

```javascript
// Open the side panel
chrome.sidePanel.open({ windowId: window.id });

// Set behavior (auto-open on icon click)
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
```

### 2. **chrome.storage**

Store data persistently (like localStorage, but better).

```javascript
// Save data
chrome.storage.local.set({
  selectedLLM: "https://chatgpt.com",
  selectedName: "ChatGPT",
});

// Read data
chrome.storage.local.get(["selectedLLM"], (result) => {
  console.log(result.selectedLLM);
});
```

**Why not localStorage?**

- `localStorage` is isolated per-page
- `chrome.storage` is shared across all extension pages
- `chrome.storage` works in service workers (localStorage doesn't)

### 3. **chrome.browsingData**

Clear browser data (cache, cookies, etc.).

```javascript
chrome.browsingData.remove(
  { origins: ["https://chatgpt.com"] },
  { cache: true, serviceWorkers: true },
);
```

### 4. **chrome.commands**

Handle keyboard shortcuts.

```javascript
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-vantage-panel") {
    // Open sidebar with Ctrl+Space / Cmd+Space
  }
});
```

### 5. **chrome.declarativeNetRequest**

Modify network requests (our core feature).
_Covered in detail in [DeclarativeNetRequest API](04-DeclarativeNetRequest.md)_

## Extension Lifecycle

### Installation

```javascript
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === "install") {
    console.log("First install");
  } else if (details.reason === "update") {
    console.log("Updated to version", chrome.runtime.getManifest().version);
  }
});
```

### Startup

```javascript
chrome.runtime.onStartup.addListener(() => {
  console.log("Browser started");
});
```

### Service Worker Lifecycle

- **Event-driven:** Only runs when needed
- **Sleeps:** After 30 seconds of inactivity
- **Wakes up:** When events occur (tab changes, messages, etc.)
- **State:** Must save state to `chrome.storage` (no global variables)

⚠️ **Common Mistake:** Assuming service workers stay alive forever

```javascript
// ❌ BAD: This won't persist
let userPreference = "ChatGPT";

// ✅ GOOD: Save to storage
chrome.storage.local.set({ userPreference: "ChatGPT" });
```

## Security Model

Extensions have more power than normal websites, so Chrome enforces strict security:

### 1. **Content Security Policy (CSP)**

Extensions can't run inline scripts or eval():

```html
<!-- ❌ NOT ALLOWED -->
<script>
  alert("hi");
</script>

<!-- ✅ ALLOWED -->
<script src="script.js"></script>
```

### 2. **Isolated Worlds**

Content scripts run in a separate JavaScript context:

- Can access the DOM
- Can't access page JavaScript variables
- Prevents conflicts with page scripts

### 3. **Permissions**

Users see what permissions you request before installing.

### 4. **Host Permissions Warning**

Requesting `https://*/*/*` triggers a scary warning:

> "Read and change all your data on the websites you visit"

That's why we only request specific domains like `https://*.chatgpt.com/*`.

## Common Extension Patterns

### Pattern 1: Browser Action (Icon Click)

```javascript
chrome.action.onClicked.addListener((tab) => {
  // User clicked the extension icon
});
```

### Pattern 2: Context Menus

```javascript
chrome.contextMenus.create({
  id: "myMenu",
  title: "Send to Vantage",
  contexts: ["selection"],
});
```

### Pattern 3: Tab Management

```javascript
// Get active tab
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  console.log(tabs[0].url);
});

// Create new tab
chrome.tabs.create({ url: "https://example.com" });
```

### Pattern 4: Messages Between Components

```javascript
// From content script
chrome.runtime.sendMessage({ type: "getData" });

// In background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "getData") {
    sendResponse({ data: "Hello!" });
  }
});
```

## Distribution

### Chrome Web Store

- Official marketplace for Chrome extensions
- Requires:
  - Developer account ($5 one-time fee)
  - ZIP file of your extension
  - Privacy policy (if handling user data)
  - Icons in multiple sizes (16x16, 48x48, 128x128)

_Full guide in [Publishing Guide](09-Publishing-Guide.md)_

### Sideloading

- Load unpacked extensions locally
- For development/testing only
- Shows "Developer mode" warning

## Resources

### Official Documentation

- [Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/migrating/)
- [API Reference](https://developer.chrome.com/docs/extensions/reference/)

### Community

- [Extension subreddit](https://reddit.com/r/chrome_extensions)
- [Stack Overflow - Chrome Extension Tag](https://stackoverflow.com/questions/tagged/google-chrome-extension)

### Tools

- [Extension Reloader](https://chrome.google.com/webstore/detail/extensions-reloader/) - Auto-reload extensions during development
- [Chrome Extension Source Viewer](https://chrome.google.com/webstore/detail/chrome-extension-source-v/) - Inspect other extensions' code

---

## Next Steps

Now that you understand the basics of Chrome extensions, let's dive into web security concepts that are crucial for our project:

**→ Continue to [Web Security Fundamentals](03-Web-Security-Fundamentals.md)**

Or jump to project-specific docs:

- [Manifest Explained](02-Manifest-Explained.md)
- [DeclarativeNetRequest API](04-DeclarativeNetRequest.md)

---

_Last Updated: February 6, 2026_
