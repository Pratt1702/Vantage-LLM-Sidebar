# Troubleshooting Guide

**Navigation:** [← Sidebar UI](07-Sidebar-UI.md) | [Overview](00-Overview.md) | [Next: Publishing Guide →](09-Publishing-Guide.md)

---

## Common Issues & Solutions

This guide covers every issue you might encounter with Vantage LLM Sidebar.

---

## Issue 1: Site Won't Load in Iframe

### Symptoms

```
Refused to frame 'https://chatgpt.com/' because it violates the following
Content Security Policy directive: "frame-ancestors 'none'".
```

Or blank iframe with no content.

### Diagnosis

**Check DevTools:**

1. Right-click in the sidebar
2. Select "Inspect"
3. Open **Console** tab
4. Look for CSP errors

### Solutions

#### Solution 1: Reload the Extension

**Most common fix:**

1. Go to `chrome://extensions/`
2. Find "Vantage LLM"
3. Click the **reload icon** (circular arrow)
4. Reopen the sidebar

**Why this works:**
Manifest or network rule changes require a reload.

---

#### Solution 2: Check Domain in net_rules.json

**Verify the domain is listed:**
Open `net_rules.json` and find Rule 1:

```json
{
  "id": 1,
  "condition": {
    "requestDomains": [
      "chatgpt.com",
      "www.chatgpt.com" // ← Check if this domain is here
      // ...
    ]
  }
}
```

**Common mistake:**
Forgetting to add both `example.com` and `www.example.com`.

**Fix:**
Add the missing domain and reload the extension.

---

#### Solution 3: Clear Cache Manually

**If nuclear reset didn't work:**

1. Open `chrome://settings/clearBrowserData`
2. Select **"Cached images and files"**
3. Select specific domains (e.g., `chatgpt.com`)
4. Click **"Clear data"**

Reload the sidebar.

---

#### Solution 4: Check for Subdomain Issues

**Example:**
Gemini uses `accounts.google.com` for login. If that domain isn't in the rules, login will fail.

**Fix:**

```json
"requestDomains": [
  "gemini.google.com",
  "accounts.google.com",  // ← Add this
  "google.com"
]
```

---

## Issue 2: Blank Sidebar (Nothing Loads)

### Symptoms

Sidebar opens but shows a blank white/black screen.

### Diagnosis

**Check Console:**

1. Right-click in sidebar → Inspect
2. Look for JavaScript errors

**Common errors:**

```
Uncaught ReferenceError: chrome is not defined
```

### Solutions

#### Solution 1: Check File Paths

**Verify files exist:**

- `index.html`
- `style.css`
- `script.js`

**Check HTML references:**

```html
<link rel="stylesheet" href="style.css" />
<!-- Correct path? -->
<script src="script.js"></script>
<!-- Correct path? -->
```

---

#### Solution 2: Check Manifest

**Verify side_panel configuration:**

```json
"side_panel": {
  "default_path": "index.html"  // ← File must exist
}
```

---

#### Solution 3: Check for Syntax Errors

**HTML:**
Run through [W3C Validator](https://validator.w3.org/)

**CSS:**
Run through [CSS Validator](https://jigsaw.w3.org/css-validator/)

**JavaScript:**
Check for missing semicolons, brackets, etc.

---

## Issue 3: Dropdown Doesn't Work

### Symptoms

Clicking the dropdown does nothing, or options don't appear.

### Diagnosis

**Check Console:**
Look for JavaScript errors:

```
Uncaught TypeError: Cannot read properties of null (reading 'addEventListener')
```

### Solutions

#### Solution 1: Check Element IDs

**Verify IDs match:**

**HTML:**

```html
<div id="llm-dropdown">...</div>
```

**JavaScript:**

```javascript
const dropdown = document.getElementById("llm-dropdown");
```

IDs must match exactly (case-sensitive).

---

#### Solution 2: Check CSS Classes

**Verify "active" class exists:**

```css
.custom-dropdown.active .dropdown-options {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}
```

Without this, the dropdown options stay hidden.

---

## Issue 4: LLM Selection Doesn't Persist

### Symptoms

You select Claude, close the sidebar, reopen it → back to ChatGPT.

### Diagnosis

**Check Chrome Storage:**

```javascript
chrome.storage.local.get(null, (data) => console.log(data));
```

Run this in the sidebar console. Should show:

```javascript
{ selectedLLM: "https://claude.ai", selectedName: "Claude" }
```

### Solutions

#### Solution 1: Check Storage Permission

**Verify manifest.json:**

```json
"permissions": [
  "storage"  // ← This must be present
]
```

---

#### Solution 2: Check Save Logic

**script.js should have:**

```javascript
chrome.storage.local.set({ selectedLLM: url, selectedName: name });
```

**Common mistake:**
Using `localStorage` instead of `chrome.storage`:

```javascript
localStorage.setItem("selectedLLM", url); // ❌ Won't work in extensions
```

---

## Issue 5: Login Doesn't Work / Immediately Logs Out

### Symptoms

You log into ChatGPT/Gemini, but get logged out immediately or stuck in a login loop.

### Diagnosis

**Check cookies:**
Open DevTools → Application → Cookies → Look for session cookies.

If cookies have `SameSite=Strict` or `SameSite=Lax`, they won't work in cross-origin iframes.

### Solutions

#### Solution 1: Verify Set-Cookie Rule

**net_rules.json Rule 1:**

```json
{
  "header": "Set-Cookie",
  "operation": "append",
  "value": "SameSite=None; Secure"
}
```

This forces cookies to work in iframes.

---

#### Solution 2: Check HTTPS

**`SameSite=None` requires `Secure` flag, which requires HTTPS.**

All our LLM sites use HTTPS, so this should be fine. But if you test locally with HTTP, cookies won't work.

---

#### Solution 3: Nuclear Reset

**Clear existing cookies:**

```javascript
chrome.browsingData.removeCookies({ origins: ["https://chatgpt.com"] });
```

Then reload the sidebar and log in again.

---

## Issue 6: Keyboard Shortcut Doesn't Work

### Symptoms

Pressing Ctrl+Space (or Cmd+Space) doesn't open the sidebar.

### Diagnosis

**Check shortcut conflicts:**

1. Go to `chrome://extensions/shortcuts`
2. Find "Vantage LLM - Open Vantage AI Sidebar"
3. Check if another extension uses the same shortcut

### Solutions

#### Solution 1: Change Shortcut

**At chrome://extensions/shortcuts:**
Click the pencil icon next to "Open Vantage AI Sidebar" and set a new shortcut (e.g., `Ctrl+Shift+Space`).

---

#### Solution 2: Check Background Script

**background.js should have:**

```javascript
chrome.commands.onCommand.addListener((command) => {
  if (command === "toggle-vantage-panel") {
    chrome.windows.getCurrent((window) => {
      chrome.sidePanel.open({ windowId: window.id });
    });
  }
});
```

---

#### Solution 3: Check Manifest

**manifest.json should have:**

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

**Command name must match:**

- Manifest: `"toggle-vantage-panel"`
- background.js: `command === "toggle-vantage-panel"`

---

## Issue 7: Perplexity-Specific Issues

### Symptoms

Perplexity shows CSP errors even with rules in place.

### Diagnosis

**Check exact error:**

```
Refused to frame 'https://www.perplexity.ai/' because it violates the following
Content Security Policy directive: "frame-ancestors 'self' https://onedrive.live.com".
```

### Solutions

#### Solution 1: Check Both www and non-www

**Perplexity uses both:**

```json
"requestDomains": [
  "perplexity.ai",       // ← Without www
  "www.perplexity.ai"    // ← With www (both needed!)
]
```

**Referer rule should also include both:**

```json
"condition": {
  "requestDomains": ["perplexity.ai", "www.perplexity.ai"]
}
```

---

## Issue 8: Google Sign-In Issues (Gemini)

### Symptoms

Google login page doesn't load in the sidebar.

### Diagnosis

**Error:**

```
Refused to frame 'https://accounts.google.com/' because it violates the following
Content Security Policy directive: "frame-ancestors https://gemini.google.com".
```

### Solutions

#### Solution 1: Add accounts.google.com to Rules

**Rule 1 domains:**

```json
"requestDomains": [
  "gemini.google.com",
  "accounts.google.com",  // ← Must have this
  "google.com"
]
```

**Rule 80 (dedicated rule for Google Accounts):**

```json
{
  "id": 80,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://accounts.google.com/"
      },
      {
        "header": "Origin",
        "operation": "set",
        "value": "https://accounts.google.com"
      }
    ]
  },
  "condition": {
    "requestDomains": ["accounts.google.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

---

## Issue 9: Extension Won't Load/Install

### Symptoms

Chrome shows errors when trying to load the extension.

### Common Errors

#### "Manifest file is missing or unreadable"

**Solution:**

- Check file name: `manifest.json` (lowercase, no typos)
- Check JSON syntax (use [JSONLint](https://jsonlint.com/))

#### "Invalid value for 'manifest_version'"

**Solution:**

```json
"manifest_version": 3  // Must be integer, not string
```

#### "Permission 'foobar' is unknown"

**Solution:**
Remove the invalid permission or fix the typo.

#### "Invalid value for 'version'"

**Solution:**
Version must be in format `X.Y.Z` (e.g., `1.0.0`), max 4 parts.

---

## Issue 10: Poor Performance / Slow Loading

### Symptoms

Sidebar takes a long time to open or sites load slowly.

### Solutions

#### Solution 1: Minimize Rules

**Current:** 8 rules (very efficient)

**Don't add unnecessary rules:**
Each rule has minimal overhead, but unnecessary rules add up.

---

#### Solution 2: Check Network Tab

**Diagnose slow resources:**

1. Open DevTools in sidebar
2. Go to Network tab
3. Reload LLM site
4. Look for slow-loading resources (>5 seconds)

**Common culprits:**

- Ads (shouldn't be present)
- Large images
- External APIs

---

#### Solution 3: Clear Cache

```javascript
chrome.browsingData.removeCache({ origins: ["https://chatgpt.com"] });
```

Old cached resources can slow things down.

---

## Issue 11: CSS Not Loading / Broken Styles

### Symptoms

Dropdown has no styling, footer looks plain.

### Diagnosis

**Check Network Tab:**
Look for failed requests to `style.css`:

```
Failed to load resource: net::ERR_FILE_NOT_FOUND style.css
```

### Solutions

#### Solution 1: Check File Path

**HTML:**

```html
<link rel="stylesheet" href="style.css" />
```

**File structure:**

```
Vantage-LLM-Sidebar/
├── index.html
├── style.css  ← Must be in the same directory
```

---

#### Solution 2: Check CSP (Extension's Own CSP)

**Extensions have strict CSP by default.**

**Can't use inline styles:**

```html
<div style="color: red;">Text</div>
<!-- ❌ Blocked -->
```

**Must use external CSS:**

```html
<link rel="stylesheet" href="style.css" />
<!-- ✅ Allowed -->
```

---

## Issue 12: Service Worker Errors

### Symptoms

Background script isn't running, or shows errors in `chrome://extensions/`.

### Diagnosis

**Check service worker status:**

1. Go to `chrome://extensions/`
2. Look for "Service worker" under Vantage LLM
3. Click it to see console

**Common errors:**

```
Uncaught SyntaxError: Unexpected token
```

### Solutions

#### Solution 1: Check Syntax

**Look for:**

- Missing semicolons
- Unmatched brackets `{}`
- Missing function arguments

#### Solution 2: Check API Usage

**Service workers can't use DOM:**

```javascript
document.getElementById("foo"); // ❌ No DOM in service workers
```

**Service workers can't use localStorage:**

```javascript
localStorage.setItem("key", "value"); // ❌ Use chrome.storage
```

---

## Issue 13: Icons Not Showing

### Symptoms

Extension icon is blank or shows default puzzle piece.

### Solutions

#### Solution 1: Check Icon Files

**Files must exist:**

```
Vantage-LLM-Sidebar/
├── icon16.png
├── icon48.png
├── icon128.png
```

#### Solution 2: Check Manifest

```json
"icons": {
  "16": "icon16.png",   // ← Correct filename?
  "48": "icon48.png",
  "128": "icon128.png"
}
```

#### Solution 3: Optimize Icon Size

**Our icons are 2MB+ each (way too large!).**

**Optimize:**

- Use [TinyPNG](https://tinypng.com/)
- Target: <50KB per icon
- Format: PNG with transparency

---

## Debugging Techniques

### 1. Console Logging

**In script.js:**

```javascript
console.log("Dropdown clicked");
console.log("Selected LLM:", url);
```

**View logs:**
Right-click sidebar → Inspect → Console

---

### 2. Inspect Network Requests

**DevTools → Network Tab:**

- See all requests made by the LLM site
- Check for failed requests (red)
- See response headers (verify CSP is removed)

---

### 3. Check Chrome Storage

**In sidebar console:**

```javascript
chrome.storage.local.get(null, (data) => {
  console.log("All stored data:", data);
});
```

---

### 4. Force Reload Extension

**Complete reset:**

1. Remove extension
2. Close all Chrome windows
3. Reopen Chrome
4. Load extension again

**Why this helps:**
Clears all cached state, service workers, etc.

---

### 5. Test in Incognito

**Open sidebar in incognito mode:**

- No extensions (unless allowed)
- No cached data
- Fresh environment

**How to allow in incognito:**

1. `chrome://extensions/`
2. Find Vantage LLM
3. Click "Details"
4. Enable "Allow in incognito"

---

## Browser Compatibility

### Chrome

✅ **Fully supported** (Chrome 114+)

### Microsoft Edge

✅ **Fully supported** (Edge 114+)

**Note:** Edge uses the same Chromium engine as Chrome.

### Brave

✅ **Should work** (Brave is Chromium-based)

**Potential issue:** Brave blocks some scripts by default.

**Solution:** Disable shields for the LLM sites.

### Firefox

❌ **Not supported**

**Why:**
Firefox doesn't support Manifest V3 or Side Panel API yet.

**Alternative:**
Would need a complete rewrite for Firefox's extension APIs.

---

## Getting Help

### Check Existing Issues

**GitHub Issues:**
[github.com/yourrepo/vantage-llm/issues](https://github.com)

Search for similar problems.

### Create a New Issue

**Include:**

1. **Chrome version:** `chrome://settings/help`
2. **Extension version:** Check `manifest.json` or `chrome://extensions`
3. **Error message:** Copy from DevTools console
4. **Steps to reproduce:** What you did before it broke
5. **Screenshots:** If applicable

### Community Support

**Reddit:**

- r/chrome_extensions
- r/webdev

**Stack Overflow:**
Tag: `google-chrome-extension`

---

## Preventive Maintenance

### Regular Updates

**Keep Chrome updated:**
New APIs and bug fixes are added regularly.

**Update dependencies:**
Check if Google Fonts has updated Inter font.

### Test After Chrome Updates

**Chrome updates frequently:**
Test the extension after major Chrome updates (every ~6 weeks).

### Monitor LLM Site Changes

**If ChatGPT/Gemini updates their CSP:**
You might need to update `net_rules.json`.

**How to detect:**
Check DevTools console for new CSP errors.

---

## Further Reading

- [Chrome Extension Debugging](https://developer.chrome.com/docs/extensions/mv3/tut_debugging/)
- [Common Extension Errors](https://developer.chrome.com/docs/extensions/mv3/manifestErrors/)
- [Side Panel API Issues](https://github.com/GoogleChrome/chrome-extensions-samples/issues)

---

## Next Steps

**→ Continue to [Publishing Guide](09-Publishing-Guide.md)**

Learn how to release your extension to the Chrome Web Store.

---

_Last Updated: February 6, 2026_
