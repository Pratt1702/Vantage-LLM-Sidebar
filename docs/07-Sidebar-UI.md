# Sidebar UI Architecture

**Navigation:** [← Background Script](06-Background-Script.md) | [Overview](00-Overview.md) | [Next: Troubleshooting →](08-Troubleshooting.md)

---

## Overview

The sidebar UI consists of **three files**:

- **`index.html`** - Structure (79 lines)
- **`style.css`** - Glassmorphic design (147 lines)
- **`script.js`** - Functionality (80 lines)

**Total:** ~300 lines of simple, clean code.

---

## Component Architecture

```
┌─────────────────────────────────────┐
│         Vantage Sidebar UI          │
├─────────────────────────────────────┤
│                                     │
│  ┌───────────────────────────────┐ │
│  │       LLM Iframe (fullscreen) │ │
│  │                               │ │
│  │   (ChatGPT/Gemini/Claude...)  │ │
│  │                               │ │
│  │                               │ │
│  └───────────────────────────────┘ │
│                                     │
│  ┌───────────────────────────────┐ │
│  │ [Built by Shelfscape] [▼Chat] │ │
│  │                       GPT v1.0 │ │
│  └───────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## index.html - Complete Breakdown

### DOCTYPE and Head

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Vantage LLM - Your AI Sidebar</title>
    <link rel="stylesheet" href="style.css" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap"
      rel="stylesheet"
    />
  </head>
</html>
```

#### Key Elements

**`<meta charset="UTF-8" />`**
UTF-8 encoding for international characters.

**`<meta name="viewport" ...>`**
Responsive design (scales on different screen sizes).

**`<title>`**
Shows in browser tab (though side panels don't usually show tabs).

**Google Fonts:**

- `preconnect` - Speed optimization (establishes connection early)
- Inter font - Modern, clean, professional
- Weights: 400 (regular), 500 (medium), 600 (semi-bold)

---

### Body Structure

```html
<body>
  <main class="content">
    <iframe
      id="llm-frame"
      src="https://chatgpt.com"
      frameborder="0"
      allow="
        clipboard-read;
        clipboard-write;
        microphone;
        camera;
        midi;
        encrypted-media;
        gyroscope;
        picture-in-picture;
        web-share;
        display-capture;
        autoplay;
      "
    ></iframe>
  </main>

  <footer class="footer">
    <!-- ... -->
  </footer>

  <script src="script.js"></script>
</body>
```

---

### The Iframe

```html
<iframe
  id="llm-frame"
  src="https://chatgpt.com"
  frameborder="0"
  allow="..."
></iframe>
```

#### Attributes

**`id="llm-frame"`**
JavaScript uses this to change the src when switching LLMs.

**`src="https://chatgpt.com"`**
Default LLM (ChatGPT).

- Gets overridden if user previously selected a different LLM (stored in `chrome.storage`)

**`frameborder="0"`**
Remove the default iframe border (legacy attribute, but still works).

**`allow="..."`**
Permissions the iframe can use.

#### Permission Breakdown

| Permission           | What It Allows                               |
| -------------------- | -------------------------------------------- |
| `clipboard-read`     | Read from clipboard (for paste)              |
| `clipboard-write`    | Write to clipboard (for copy)                |
| `microphone`         | Use microphone (ChatGPT Voice, etc.)         |
| `camera`             | Use webcam (future features)                 |
| `midi`               | MIDI devices (unlikely needed, but harmless) |
| `encrypted-media`    | DRM content (videos, etc.)                   |
| `gyroscope`          | Device orientation (mobile)                  |
| `picture-in-picture` | PiP mode for videos                          |
| `web-share`          | Share API (share to other apps)              |
| `display-capture`    | Screen sharing (ChatGPT desktop sharing)     |
| `autoplay`           | Auto-play media                              |

**Why so many?**
Better to grant permissions the LLM might need than have features break.

**Security:**
These permissions only apply to the **iframe content** (chatgpt.com, etc.), not our extension.

---

### Footer Section

```html
<footer class="footer">
  <div class="info-bar">
    <span class="credit">
      Built to help people ❤️ by
      <a href="https://shelfscape.app" target="_blank" id="shelfscape-link">
        Shelfscape
      </a>
    </span>

    <div class="custom-dropdown" id="llm-dropdown">
      <!-- Dropdown UI -->
    </div>

    <span class="version">v1.0.0</span>
  </div>
</footer>
```

#### Components

**Credit/Branding:**

```html
<span class="credit">
  Built to help people ❤️ by
  <a href="https://shelfscape.app" target="_blank" id="shelfscape-link">
    Shelfscape
  </a>
</span>
```

- Link to your Shelfscape project
- `target="_blank"` opens in new tab
- Heart emoji for personality

**Version Number:**

```html
<span class="version">v1.0.0</span>
```

Matches `manifest.json` version. Update manually when releasing new versions.

---

### Custom Dropdown

```html
<div class="custom-dropdown" id="llm-dropdown">
  <div class="dropdown-selected">
    <span id="selected-text">ChatGPT</span>
    <div class="dropdown-arrow"></div>
  </div>
  <div class="dropdown-options">
    <div class="option" data-value="https://chatgpt.com">ChatGPT</div>
    <div class="option" data-value="https://claude.ai">Claude</div>
    <div class="option" data-value="https://chat.deepseek.com">DeepSeek</div>
    <div class="option" data-value="https://gemini.google.com">Gemini</div>
    <div
      class="option"
      data-value="https://aistudio.google.com/app/prompts/new_chat"
    >
      Nano Banana
    </div>
    <div class="option" data-value="https://www.perplexity.ai">Perplexity</div>
  </div>
</div>
```

#### Structure

**Selected item display:**

```html
<div class="dropdown-selected">
  <span id="selected-text">ChatGPT</span>
  <div class="dropdown-arrow"></div>
</div>
```

- Shows currently selected LLM
- Arrow indicator (styled in CSS)

**Options list:**

```html
<div class="dropdown-options">
  <div class="option" data-value="https://chatgpt.com">ChatGPT</div>
  <!-- ... -->
</div>
```

- `data-value` attribute stores the URL
- JavaScript reads this when clicked

#### Adding a New LLM

To add "NewLLM":

```html
<div class="option" data-value="https://newllm.com">NewLLM</div>
```

And update `net_rules.json` (see [Network Rules](05-Net-Rules-Explained.md#maintenance)).

---

## style.css - Glassmorphism Design

### Design Philosophy

**Glassmorphism:**

- Semi-transparent backgrounds
- Blur effects
- Subtle borders
- Layered depth

**Color Palette:**

- Dark base (#111, #1a1a1a)
- Purple accent (#6366f1)
- Soft white text (#e0e0e0, #b3b3b3)

---

### Global Styles

```css
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: "Inter", sans-serif;
  background: linear-gradient(135deg, #111 0%, #1a1a1a 100%);
  color: #e0e0e0;
  overflow: hidden;
  height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
}
```

#### Key Choices

**`box-sizing: border-box`**
Padding/border included in width calculations (easier layout).

**`font-family: "Inter"`**
Modern, readable sans-serif font.

**`background: linear-gradient`**
Dark gradient (top: #111, bottom: #1a1a1a).

**`overflow: hidden`**
Prevent scrollbars on body (iframe handles its own scrolling).

**`height: 100vh`**
Full viewport height (sidebar fills the entire height).

**`display: flex; flex-direction: column`**
Stack content (iframe) above footer.

---

### Iframe Styling

```css
.content {
  flex: 1;
  display: flex;
  position: relative;
  overflow: hidden;
}

iframe {
  width: 100%;
  height: 100%;
  border: none;
  border-radius: 0;
  flex: 1;
}
```

**`flex: 1`**
Takes up all available space (pushes footer to bottom).

**`border: none`**
Remove default iframe border.

**`width: 100%; height: 100%`**
Fill the container completely.

---

### Footer Styling (Glassmorphism)

```css
.footer {
  background: rgba(26, 26, 26, 0.7);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0.65rem 1rem;
  z-index: 10;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3);
}
```

#### Glassmorphic Effects

**`background: rgba(26, 26, 26, 0.7)`**
Semi-transparent dark background (70% opacity).

**`backdrop-filter: blur(12px)`**
Blurs content behind the footer (creates glass effect).

**`-webkit-backdrop-filter`**
Safari compatibility.

**`border-top: 1px solid rgba(255, 255, 255, 0.08)`**
Subtle white border (8% opacity).

**`box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.3)`**
Shadow above footer (creates depth).

---

### Info Bar Layout

```css
.info-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
  font-size: 0.8rem;
}
```

**`display: flex`**
Horizontal layout.

**`justify-content: space-between`**
Credit on left, version on right, dropdown in middle.

**`gap: 1rem`**
Spacing between elements.

---

### Dropdown Styling

```css
.custom-dropdown {
  position: relative;
  min-width: 140px;
  cursor: pointer;
}

.dropdown-selected {
  background: rgba(99, 102, 241, 0.12);
  border: 1px solid rgba(99, 102, 241, 0.3);
  border-radius: 8px;
  padding: 0.5rem 0.75rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}
```

#### Visual Design

**`background: rgba(99, 102, 241, 0.12)`**
Purple tint (12% opacity).

**`border: 1px solid rgba(99, 102, 241, 0.3)`**
Purple border (30% opacity).

**`border-radius: 8px`**
Rounded corners (modern look).

**`transition: all 0.25s cubic-bezier(...)`**
Smooth animation (ease-in-out curve).

---

### Dropdown Arrow

```css
.dropdown-arrow {
  width: 0;
  height: 0;
  border-left: 4px solid transparent;
  border-right: 4px solid transparent;
  border-top: 5px solid #6366f1;
  margin-left: 0.5rem;
  transition: transform 0.25s ease;
}

.custom-dropdown.active .dropdown-arrow {
  transform: rotate(180deg);
}
```

**CSS Triangle Trick:**

- `border-left/right: transparent` - Creates triangle shape
- `border-top: solid` - The actual visible part
- `transform: rotate(180deg)` - Flips when dropdown opens

---

### Dropdown Options

```css
.dropdown-options {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  right: 0;
  background: rgba(30, 30, 35, 0.95);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  overflow: hidden;
  opacity: 0;
  transform: translateY(10px) scale(0.95);
  pointer-events: none;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.custom-dropdown.active .dropdown-options {
  opacity: 1;
  transform: translateY(0) scale(1);
  pointer-events: all;
}
```

#### Animation Details

**Hidden state:**

- `opacity: 0` - Invisible
- `transform: translateY(10px) scale(0.95)` - Slightly below and smaller
- `pointer-events: none` - Can't be clicked

**Active state (when clicked):**

- `opacity: 1` - Fully visible
- `transform: translateY(0) scale(1)` - Normal position and size
- `pointer-events: all` - Clickable

**`position: absolute; bottom: calc(100% + 8px)`**
Positioned above the dropdown (8px gap).

---

### Option Hover Effects

```css
.option {
  padding: 0.65rem 1rem;
  cursor: pointer;
  transition:
    background 0.2s ease,
    color 0.2s ease;
  font-size: 0.85rem;
  color: #b3b3b3;
}

.option:hover {
  background: rgba(99, 102, 241, 0.15);
  color: #fff;
}

.option.active {
  background: rgba(99, 102, 241, 0.2);
  color: #a5b4fc;
  font-weight: 500;
}
```

**Normal state:** Gray text (#b3b3b3)
**Hover:** Purple background, white text
**Active (selected):** Brighter purple, light purple text

---

## script.js - Functionality

### Event Listener Setup

```javascript
document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("llm-dropdown");
  const selectedText = document.getElementById("selected-text");
  const iframe = document.getElementById("llm-frame");
  const options = document.querySelectorAll(".option");

  // ... event handlers ...
});
```

**`DOMContentLoaded`**
Waits for HTML to load before running JavaScript.

**Element references:**

- `dropdown` - The dropdown container
- `selectedText` - The displayed LLM name
- `iframe` - The embedded LLM site
- `options` - All dropdown options (NodeList)

---

### Dropdown Toggle

```javascript
// Toggle dropdown
dropdown.addEventListener("click", (e) => {
  dropdown.classList.toggle("active");
  e.stopPropagation();
});
```

**`classList.toggle("active")`**
Adds or removes the "active" class.

- CSS shows/hides dropdown options based on this class

**`e.stopPropagation()`**
Prevents the click from bubbling to the document listener (which closes the dropdown).

---

### Close on Outside Click

```javascript
// Close dropdown when clicking outside
document.addEventListener("click", (e) => {
  if (!dropdown.contains(e.target)) {
    dropdown.classList.remove("active");
  }
});
```

**`dropdown.contains(e.target)`**
Checks if the clicked element is inside the dropdown.

- If not → close the dropdown

---

### Close When Iframe Gets Focus

```javascript
// Handle clicks inside the iframe
window.addEventListener("blur", () => {
  if (document.activeElement === iframe) {
    dropdown.classList.remove("active");
  }
});
```

**Problem:** Clicking inside an iframe doesn't trigger normal click events.

**Solution:** Detect when the window loses focus (`blur`) and check if the iframe is active.

**Why this matters:**
Without this, clicking in the iframe wouldn't close the dropdown.

---

### Handle LLM Selection

```javascript
options.forEach((option) => {
  option.addEventListener("click", () => {
    const url = option.getAttribute("data-value");
    const name = option.textContent.trim();

    iframe.src = url;
    selectedText.textContent = name;

    // Update active state in UI
    options.forEach((opt) => opt.classList.remove("active"));
    option.classList.add("active");

    // Save preference
    chrome.storage.local.set({ selectedLLM: url, selectedName: name });
  });
});
```

#### Step-by-Step

**1. Read URL and name from clicked option:**

```javascript
const url = option.getAttribute("data-value"); // "https://claude.ai"
const name = option.textContent.trim(); // "Claude"
```

**2. Update iframe:**

```javascript
iframe.src = url;
```

Loads the new LLM site.

**3. Update displayed text:**

```javascript
selectedText.textContent = name;
```

Shows "Claude" instead of "ChatGPT".

**4. Update visual state:**

```javascript
options.forEach((opt) => opt.classList.remove("active"));
option.classList.add("active");
```

Highlights the selected option (purple background).

**5. Save to storage:**

```javascript
chrome.storage.local.set({ selectedLLM: url, selectedName: name });
```

Persists the choice so it's remembered next time.

---

### Load Saved Preference

```javascript
// Load saved preference
chrome.storage.local.get(["selectedLLM", "selectedName"], (result) => {
  let savedUrl = result.selectedLLM;
  let savedName = result.selectedName;

  // RESET: If user has ANY legacy Copilot/Bing URL saved, move them to ChatGPT
  if (
    savedUrl &&
    (savedUrl.includes("microsoft.com") || savedUrl.includes("bing.com"))
  ) {
    savedUrl = "https://chatgpt.com";
    savedName = "ChatGPT";
    chrome.storage.local.set({
      selectedLLM: savedUrl,
      selectedName: savedName,
    });
  }

  if (savedUrl) {
    selectedText.textContent = savedName;
    iframe.src = savedUrl;

    // Mark active in dropdown
    options.forEach((option) => {
      if (option.getAttribute("data-value") === savedUrl) {
        option.classList.add("active");
      }
    });
  } else {
    // Default to first option if nothing saved
    const defaultOpt = options[0];
    if (defaultOpt) defaultOpt.classList.add("active");
  }
});
```

#### Flow

**1. Read from storage:**

```javascript
chrome.storage.local.get(["selectedLLM", "selectedName"], (result) => { ... });
```

**2. Legacy Copilot migration:**

```javascript
if (
  savedUrl &&
  (savedUrl.includes("microsoft.com") || savedUrl.includes("bing.com"))
) {
  savedUrl = "https://chatgpt.com";
  savedName = "ChatGPT";
  chrome.storage.local.set({ selectedLLM: savedUrl, selectedName: savedName });
}
```

**Why?**
Copilot was removed from the extension (unreliable). If a user had Copilot saved, we reset them to ChatGPT.

**3. Apply saved preference:**

```javascript
selectedText.textContent = savedName;
iframe.src = savedUrl;
```

**4. Highlight in dropdown:**

```javascript
options.forEach((option) => {
  if (option.getAttribute("data-value") === savedUrl) {
    option.classList.add("active");
  }
});
```

**5. Default to ChatGPT:**

```javascript
if (!savedUrl) {
  const defaultOpt = options[0]; // ChatGPT (first option)
  if (defaultOpt) defaultOpt.classList.add("active");
}
```

---

## Interaction Flow

### User Opens Extension

1. Clicks extension icon OR presses Ctrl+Space
2. Background script opens side panel
3. `index.html` loads
4. `script.js` runs:
   - Reads saved LLM from `chrome.storage`
   - Sets iframe src to saved LLM (or defaults to ChatGPT)
   - Highlights active option in dropdown

### User Switches LLM

1. Clicks dropdown → Opens options list
2. Clicks "Claude" → Triggers click handler
3. JavaScript:
   - Changes iframe src to `https://claude.ai`
   - Updates selected text to "Claude"
   - Saves to `chrome.storage`
   - Highlights "Claude" option
4. Iframe loads Claude
5. `net_rules.json` strips CSP headers
6. Claude loads successfully in sidebar

---

## Responsiveness

### Footer Adapts to Width

```css
@media (max-width: 400px) {
  .info-bar {
    flex-direction: column;
    gap: 0.5rem;
  }

  .credit,
  .version {
    font-size: 0.7rem;
  }
}
```

**For narrow sidebars (<400px):**

- Stack elements vertically
- Reduce font size

---

## Performance Optimizations

### Font Loading

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
```

**`preconnect`:**
Establishes early connection to Google Fonts, speeding up font loading.

### CSS Transitions

```css
transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
```

**`cubic-bezier`:**
Custom easing function (smoother than linear).

**GPU Acceleration:**
`transform` and `opacity` are GPU-accelerated (smooth animations).

---

## Accessibility

### Keyboard Navigation

**Currently limited:**

- No keyboard navigation for dropdown (only mouse)

**Could improve:**

```javascript
dropdown.addEventListener("keydown", (e) => {
  if (e.key === "Enter" || e.key === " ") {
    dropdown.classList.toggle("active");
  }
});
```

### Screen Readers

**Could improve:**

```html
<div class="custom-dropdown" role="combobox" aria-expanded="false">
  <div class="dropdown-selected" aria-label="Select LLM">
    <span id="selected-text">ChatGPT</span>
  </div>
</div>
```

---

## Extending the UI

### Add a Settings Button

```html
<footer class="footer">
  <div class="info-bar">
    <span class="credit">...</span>
    <button id="settings-btn">⚙️</button>
    <div class="custom-dropdown">...</div>
    <span class="version">...</span>
  </div>
</footer>
```

```javascript
document.getElementById("settings-btn").addEventListener("click", () => {
  // Open settings page
  chrome.tabs.create({ url: "settings.html" });
});
```

### Add Theme Toggle

```javascript
const themeToggle = document.getElementById("theme-toggle");
themeToggle.addEventListener("click", () => {
  document.body.classList.toggle("light-theme");
  chrome.storage.local.set({
    theme: document.body.classList.contains("light-theme") ? "light" : "dark",
  });
});
```

---

## Further Reading

- [CSS Glassmorphism](https://css-tricks.com/glassmorphism/)
- [Chrome Storage API](https://developer.chrome.com/docs/extensions/reference/storage/)
- [MDN: iframe](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/iframe)

---

## Next Steps

**→ Continue to [Troubleshooting Guide](08-Troubleshooting.md)**

Or explore other topics:

- [Publishing Guide](09-Publishing-Guide.md)
- [Back to Overview](00-Overview.md)

---

_Last Updated: February 6, 2026_
