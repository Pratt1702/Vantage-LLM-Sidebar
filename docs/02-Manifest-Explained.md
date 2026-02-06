# Manifest Explained - Line by Line

**Navigation:** [← Chrome Extension Basics](01-Chrome-Extension-Basics.md) | [Overview](00-Overview.md) | [Next: Web Security →](03-Web-Security-Fundamentals.md)

---

## What is manifest.json?

The **manifest.json** file is the **blueprint** of your Chrome extension. It tells Chrome:

- What your extension is called
- What permissions it needs
- What files to load
- What capabilities it has

Think of it as the **resume** your extension shows Chrome when asking to be installed.

## Our Complete Manifest

Let's break down **every single line** of our manifest.json:

```json
{
  "manifest_version": 3,
  "name": "Vantage LLM - Your AI Sidebar",
  "version": "1.0.0",
  "description": "Access your favorite LLMs (ChatGPT, Gemini, Claude, Perplexity) in a professional, glassmorphic sidebar.",
  "icons": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  },
  "permissions": [
    "sidePanel",
    "declarativeNetRequest",
    "storage",
    "browsingData"
  ],
  "host_permissions": [
    "https://*.chatgpt.com/*",
    "https://*.google.com/*",
    "https://*.perplexity.ai/*",
    "https://*.bing.com/*",
    "https://*.microsoft.com/*",
    "https://*.microsoft365.com/*",
    "https://*.live.com/*",
    "https://*.microsoftonline.com/*",
    "https://*.claude.ai/*",
    "https://*.anthropic.com/*",
    "https://*.deepseek.com/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "side_panel": {
    "default_path": "index.html"
  },
  "action": {
    "default_title": "Open Vantage",
    "default_icon": {
      "16": "icon16.png",
      "48": "icon48.png",
      "128": "icon128.png"
    }
  },
  "commands": {
    "toggle-vantage-panel": {
      "suggested_key": {
        "default": "Ctrl+Space",
        "mac": "Command+Space"
      },
      "description": "Open Vantage AI Sidebar"
    }
  },
  "declarative_net_request": {
    "rule_resources": [
      {
        "id": "ruleset_1",
        "enabled": true,
        "path": "net_rules.json"
      }
    ]
  }
}
```

---

## Field-by-Field Breakdown

### `"manifest_version": 3`

**What it is:**
Specifies which version of the Chrome Extension platform we're using.

**Why we use 3:**

- Manifest V2 is being deprecated (stops working in 2024/2025)
- V3 is the current standard
- Required for modern APIs like `declarativeNetRequest`

**Alternatives:**

- `2` - Legacy version (don't use)
- No other options

---

### `"name": "Vantage LLM - Your AI Sidebar"`

**What it is:**
The public-facing name of your extension.

**Where it appears:**

- Chrome Web Store
- Extension icon tooltip
- Extension management page (`chrome://extensions/`)
- Permission prompts

**Best practices:**

- Keep it under 45 characters
- Make it descriptive and searchable
- Include keywords (we use "LLM" and "AI Sidebar")

---

### `"version": "1.0.0"`

**What it is:**
The version number of your extension.

**Format:**
`major.minor.patch` (semantic versioning)

- **Major** (1): Breaking changes
- **Minor** (0): New features, backward compatible
- **Patch** (0): Bug fixes

**Why it matters:**

- Chrome Web Store uses this for updates
- Users see when a new version is available
- Auto-update mechanism relies on version comparison

**We're at 1.0.0 because:**

- First stable release
- Core features complete
- Ready for production use

---

### `"description": "Access your favorite LLMs..."`

**What it is:**
Short description of what the extension does.

**Character limit:**
132 characters maximum

**Where it appears:**

- Extension management page
- Chrome Web Store (short description field)
- Search results

**Our description:**
We mention specific LLMs (ChatGPT, Gemini, etc.) for SEO and clarity.

---

### `"icons": { ... }`

**What it is:**
Extension icons in different sizes for different contexts.

```json
"icons": {
  "16": "icon16.png",   // Favicon, extension pages
  "48": "icon48.png",   // Extension management page
  "128": "icon128.png"  // Chrome Web Store, installation
}
```

**Why multiple sizes:**
Chrome uses different sizes in different places:

- **16x16**: Tab favicon, extension popup
- **48x48**: Extension management page
- **128x128**: Chrome Web Store listing, installation dialog

**Requirements:**

- PNG format recommended
- Square dimensions
- Transparent background (optional)

**Our icons:**
We use the same image scaled to different sizes (2157KB each - might be oversized, could optimize).

---

### `"permissions": [ ... ]`

**What it is:**
Chrome APIs your extension needs access to.

#### `"sidePanel"`

**What it does:**
Gives access to the Chrome Side Panel API.

**Why we need it:**
To create the native sidebar UI instead of a popup.

**Without it:**
We'd be limited to a small popup (like AdBlock).

**API usage:**

```javascript
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
chrome.sidePanel.open({ windowId: window.id });
```

---

#### `"declarativeNetRequest"`

**What it does:**
Allows modifying network requests (headers, redirects, blocking).

**Why we need it:**
This is the **core** of our extension. We use it to strip security headers that prevent websites from being embedded in iframes.

**Without it:**
ChatGPT, Gemini, etc. would refuse to load in our sidebar (CSP violations).

**What we do with it:**

- Remove `X-Frame-Options` headers
- Remove `Content-Security-Policy` headers
- Modify `Referer` and `Origin` headers
- Change `User-Agent` headers

**Alternatives:**

- Manifest V2's `webRequest` API (deprecated)
- No real alternatives in V3

**User warning:**
This permission doesn't trigger warnings because it's declarative (rules in JSON, not runtime code).

---

#### `"storage"`

**What it does:**
Access to `chrome.storage` API for saving data.

**Why we need it:**
To remember which LLM the user last selected (ChatGPT, Claude, etc.).

**Benefits over localStorage:**

- Shared across all extension pages
- Works in service workers
- Can sync across devices (with `chrome.storage.sync`)

**Our usage:**

```javascript
// Save
chrome.storage.local.set({
  selectedLLM: "https://chatgpt.com",
  selectedName: "ChatGPT",
});

// Load
chrome.storage.local.get(["selectedLLM"], (result) => {
  iframe.src = result.selectedLLM;
});
```

---

#### `"browsingData"`

**What it does:**
Clear browsing data (cache, cookies, history, etc.).

**Why we need it:**
On installation, we do a "nuclear reset" - clearing cache and service workers for AI websites.

**Why this matters:**

- Old cached security headers can persist
- Service workers might block our header modifications
- Fresh start ensures our rules take effect

**Our usage:**

```javascript
chrome.browsingData.remove(
  { origins: ['https://chatgpt.com', ...] },
  { cache: true, serviceWorkers: true }
);
```

**User concern:**
This is a powerful permission. We DON'T clear:

- Cookies (keeps users logged in)
- History (no privacy invasion)
- Passwords (no security risk)

---

### `"host_permissions": [ ... ]`

**What it is:**
List of website domains the extension can access.

**Why separate from permissions:**
In Manifest V3, website access is separated from API access for transparency.

**Our domains:**

```json
"https://*.chatgpt.com/*"       // ChatGPT
"https://*.google.com/*"         // Gemini, AI Studio
"https://*.perplexity.ai/*"      // Perplexity
"https://*.bing.com/*"           // Copilot
"https://*.microsoft.com/*"      // Copilot subdomains
"https://*.microsoft365.com/*"   // Microsoft auth
"https://*.live.com/*"           // Microsoft login
"https://*.microsoftonline.com/*"// Azure auth
"https://*.claude.ai/*"          // Claude
"https://*.anthropic.com/*"      // Claude resources
"https://*.deepseek.com/*"       // DeepSeek
```

**Wildcard `*` explained:**

- `https://*.chatgpt.com/*` matches:
  - `https://chatgpt.com/`
  - `https://chat.chatgpt.com/`
  - `https://auth.chatgpt.com/`
  - But NOT `http://chatgpt.com/` (must be HTTPS)

**Why so many Microsoft domains:**
Copilot uses multiple Microsoft services for authentication and functionality.

**User warning:**
These trigger a permission prompt:

> "Read and change your data on chatgpt.com, google.com, ..."

Users see this during installation.

---

### `"background": { ... }`

**What it is:**
Defines the background script (service worker) for the extension.

```json
"background": {
  "service_worker": "background.js"
}
```

**Service Worker vs. Background Page:**

- **Manifest V2:** Background pages (always running HTML page)
- **Manifest V3:** Service workers (event-driven, sleeps when idle)

**Our service worker does:**

1. Sets side panel behavior on installation
2. Clears cache/service workers for AI sites
3. Handles keyboard shortcut for opening panel

**File:** `background.js` (detailed in [Background Script](06-Background-Script.md))

---

### `"side_panel": { ... }`

**What it is:**
Configuration for the Chrome Side Panel API.

```json
"side_panel": {
  "default_path": "index.html"
}
```

**`default_path`:**
The HTML file to load when the side panel opens.

**Alternative:**
You can also specify `default_url` with a full URL:

```json
"default_url": "https://example.com"
```

But this wouldn't allow us to customize the UI or embed multiple LLMs.

**What's in index.html:**

- Dropdown for selecting LLM
- Iframe for embedding the LLM site
- Credit/branding footer
- Version number

---

### `"action": { ... }`

**What it is:**
Defines the extension icon in the Chrome toolbar.

```json
"action": {
  "default_title": "Open Vantage",
  "default_icon": {
    "16": "icon16.png",
    "48": "icon48.png",
    "128": "icon128.png"
  }
}
```

**`default_title`:**
Tooltip when hovering over the extension icon.

**`default_icon`:**
Icon shown in the toolbar (same sizes as main icons).

**What happens on click:**
Because we set `openPanelOnActionClick: true` in background.js, clicking the icon opens the side panel.

**Alternative behaviors:**

- Open a popup (`default_popup: "popup.html"`)
- Run a function (via `chrome.action.onClicked`)

---

### `"commands": { ... }`

**What it is:**
Defines keyboard shortcuts for the extension.

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

**Command name:** `toggle-vantage-panel`

- Arbitrary string identifier
- Used in `chrome.commands.onCommand.addListener()`

**`suggested_key`:**
Default keyboard shortcut (user can change it).

- **Windows/Linux:** `Ctrl+Space`
- **Mac:** `Command+Space`

**Why this shortcut:**

- `Ctrl+Space` is commonly used for autocomplete/AI tools
- Not used by Chrome itself
- Easy to remember and reach

**Conflict handling:**
If another extension uses the same shortcut, Chrome lets the user choose which one takes precedence.

**User customization:**
Users can change shortcuts at `chrome://extensions/shortcuts`

**Our implementation:**

```javascript
// background.js
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-vantage-panel") {
    chrome.windows.getCurrent((window) => {
      chrome.sidePanel.open({ windowId: window.id });
    });
  }
});
```

---

### `"declarative_net_request": { ... }`

**What it is:**
Configuration for declarativeNetRequest rules.

```json
"declarative_net_request": {
  "rule_resources": [
    {
      "id": "ruleset_1",
      "enabled": true,
      "path": "net_rules.json"
    }
  ]
}
```

**`rule_resources`:**
Array of rule files the extension uses.

**`id`:** Unique identifier for the ruleset (`"ruleset_1"`)

**`enabled`:** Whether the ruleset is active (`true` / `false`)

**`path`:** Path to the JSON file containing rules (`"net_rules.json"`)

**Why separate file:**

- Rules can get large (ours is 268 lines)
- Easier to maintain and debug
- Can have multiple rulesets (we only have one)

**Max limits:**

- **Static rules:** 30,000 per extension
- **Enabled rulesets:** 50 at once
- **Dynamic rules:** 5,000 (updated at runtime)

We use **static rules** (declared in JSON, loaded at installation).

**What's in net_rules.json:**
8 rules total:

- Rule 1: Remove security headers (CSP, X-Frame-Options, etc.)
- Rule 10: Modify User-Agent headers
- Rules 20-80: Set Referer/Origin for specific domains

**Deep dive:** [Network Rules Deep-Dive](05-Net-Rules-Explained.md)

---

## Optional Fields We DON'T Use

### `"content_scripts"`

Inject JavaScript into web pages.
**Why we don't use it:**
We embed sites in iframes instead of modifying their DOM.

### `"options_page"` / `"options_ui"`

Settings page for the extension.
**Why we don't use it:**
Our settings (LLM selection) are in the sidebar itself.

### `"web_accessible_resources"`

Make extension files accessible to web pages.
**Why we don't use it:**
Our files are only used within the extension, not by external sites.

### `"content_security_policy"`

Override the extension's CSP.
**Why we don't use it:**
Default CSP is fine for our needs.

### `"incognito"`

Control behavior in incognito mode.
**Default:** `"spanning"` (shares state with normal mode)
**Our case:** Works in incognito automatically.

---

## Manifest Validation

Chrome validates manifests on installation. Common errors:

### Missing Required Fields

```
❌ Missing or invalid manifest fields
```

Solution: Ensure `manifest_version`, `name`, and `version` are present.

### Invalid Version Format

```
❌ Invalid value for 'version'
```

Solution: Use format `X.Y.Z` (integers only, max 4 parts).

### Invalid Permissions

```
❌ Permission 'foo' is unknown or not allowed
```

Solution: Check [official permissions list](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/).

### Host Permission Format

```
❌ Invalid URLPattern 'example.com'
```

Solution: Must include protocol: `https://example.com/*`

---

## Manifest Best Practices

### 1. **Minimal Permissions**

Only request what you actually need.
❌ `"host_permissions": ["<all_urls>"]` (too broad)
✅ `"host_permissions": ["https://*.chatgpt.com/*"]` (specific)

### 2. **Clear Descriptions**

Help users understand what your extension does.
❌ `"description": "Useful extension"`
✅ `"description": "Access ChatGPT, Gemini, Claude in a sidebar"`

### 3. **Proper Versioning**

Increment versions correctly:

- Bug fixes: `1.0.0` → `1.0.1`
- New features: `1.0.0` → `1.1.0`
- Breaking changes: `1.0.0` → `2.0.0`

### 4. **Optimize Icons**

Use properly sized PNGs.
❌ 2MB+ icons (our current issue)
✅ <50KB optimized PNGs

### 5. **Default Locale**

If supporting multiple languages:

```json
"default_locale": "en"
```

---

## Testing the Manifest

### Load Extension

`chrome://extensions/` → **Load unpacked** → Select folder

### Check for Errors

Errors appear in red on the extension card.

### Validate JSON

Use a JSON validator to catch syntax errors:

```bash
npx jsonlint manifest.json
```

### Check Permissions

Install and check what permissions Chrome shows users.

---

## Updating the Manifest

### During Development

Changes to manifest.json require **reloading the extension**:

1. Go to `chrome://extensions/`
2. Click reload icon on your extension

### In Production

When publishing updates:

1. Increment `version`
2. Upload new ZIP to Chrome Web Store
3. Chrome auto-updates extensions for users (within hours)

---

## Related Files

Our manifest references these files:

- `background.js` - Background service worker
- `index.html` - Side panel UI
- `net_rules.json` - Network modification rules
- `icon*.png` - Extension icons

---

## Further Reading

- [Chrome Manifest Reference](https://developer.chrome.com/docs/extensions/mv3/manifest/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/migrating/)
- [Permissions Reference](https://developer.chrome.com/docs/extensions/mv3/declare_permissions/)

---

## Next Steps

Now that you understand the manifest, let's dive into web security concepts:

**→ Continue to [Web Security Fundamentals](03-Web-Security-Fundamentals.md)**

Or explore the technical implementation:

- [DeclarativeNetRequest API](04-DeclarativeNetRequest.md)
- [Network Rules Deep-Dive](05-Net-Rules-Explained.md)

---

_Last Updated: February 6, 2026_
