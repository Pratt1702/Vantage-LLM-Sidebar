# DeclarativeNetRequest API Deep-Dive

**Navigation:** [← Web Security](03-Web-Security-Fundamentals.md) | [Overview](00-Overview.md) | [Next: Network Rules →](05-Net-Rules-Explained.md)

---

## What is DeclarativeNetRequest?

**DeclarativeNetRequest (DNR)** is a Chrome extension API that lets you modify, block, or redirect network requests **without blocking the main thread**.

Think of it as a **traffic controller** for web requests—you define the rules, and Chrome enforces them automatically.

### The Evolution

#### Manifest V2: webRequest API (Old Way)

```javascript
// Imperative, blocking, slow
chrome.webRequest.onHeadersReceived.addListener(
  function (details) {
    // This code BLOCKS the browser while running
    details.responseHeaders = details.responseHeaders.filter(
      (h) => h.name !== "X-Frame-Options",
    );
    return { responseHeaders: details.responseHeaders };
  },
  { urls: ["<all_urls>"] },
  ["blocking", "responseHeaders", "extraHeaders"],
);
```

**Problems:**

- 🐌 **Blocks the main thread** (slows down browsing)
- 🔓 **Security risk** (extensions can read all traffic)
- ⚡ **Performance hit** (JavaScript runs for every request)

#### Manifest V3: declarativeNetRequest (New Way)

```json
{
  "id": 1,
  "priority": 1,
  "action": {
    "type": "modifyHeaders",
    "responseHeaders": [{ "header": "X-Frame-Options", "operation": "remove" }]
  },
  "condition": {
    "requestDomains": ["example.com"]
  }
}
```

**Benefits:**

- ✅ **Non-blocking** (compiled by Chrome, runs in browser process)
- ✅ **Privacy-preserving** (rules are static, no script access to requests)
- ✅ **Fast** (no JavaScript execution per request)

---

## Core Concepts

### 1. Rules

A **rule** is a JSON object that defines:

- **What to match** (which requests)
- **What to do** (modify, block, redirect, etc.)

```json
{
  "id": 1,
  "priority": 5000,
  "action": { ... },
  "condition": { ... }
}
```

### 2. Rulesets

A **ruleset** is a collection of rules in a JSON file.

```json
[
  { "id": 1, "action": {...}, "condition": {...} },
  { "id": 2, "action": {...}, "condition": {...} },
  { "id": 3, "action": {...}, "condition": {...} }
]
```

**Our ruleset:** `net_rules.json` (8 rules)

### 3. Rule Types

Three categories:

#### Static Rules

- Defined in JSON files
- Declared in manifest under `declarative_net_request.rule_resources`
- Loaded at install time
- **Max: 30,000 rules**

#### Dynamic Rules

- Added/removed at runtime via JavaScript
- Use `chrome.declarativeNetRequest.updateDynamicRules()`
- **Max: 5,000 rules**
- **We don't use these**

#### Session Rules

- Cleared when browser closes
- Use `chrome.declarativeNetRequest.updateSessionRules()`
- **Max: 5,000 rules**
- **We don't use these**

---

## Rule Anatomy

Every rule has **three parts**:

### 1. ID (Required)

```json
"id": 1
```

- Unique integer identifier
- Used to identify/update rules
- Must be unique within a ruleset

### 2. Priority (Optional)

```json
"priority": 5000
```

- Determines which rule wins if multiple match
- Higher number = higher priority
- Default: `1`
- **Our rules:** Priority `5000` and `5001`

**Why two priorities?**

- **5000:** General header stripping
- **5001:** Domain-specific overrides (Referer/Origin)

### 3. Action (Required)

```json
"action": {
  "type": "modifyHeaders",
  "responseHeaders": [...]
}
```

Defines **what to do** when the rule matches.

### 4. Condition (Required)

```json
"condition": {
  "requestDomains": ["chatgpt.com"],
  "resourceTypes": ["sub_frame"]
}
```

Defines **when to apply** the action.

---

## Action Types

DNR supports several action types:

### 1. block

Block the request entirely.

```json
{
  "id": 1,
  "action": { "type": "block" },
  "condition": {
    "urlFilter": "*://ads.example.com/*"
  }
}
```

**Use case:** Ad blockers, malware protection

**We don't use this** (we want to load sites, not block them)

---

### 2. redirect

Redirect the request to a different URL.

```json
{
  "id": 2,
  "action": {
    "type": "redirect",
    "redirect": { "url": "https://example.com/newpage" }
  },
  "condition": {
    "urlFilter": "https://example.com/oldpage"
  }
}
```

**Use case:** URL rewriting, fixing broken links

**We don't use this**

---

### 3. modifyHeaders (⭐ This is what we use)

Add, remove, or modify request/response headers.

#### Remove Response Header

```json
{
  "id": 1,
  "action": {
    "type": "modifyHeaders",
    "responseHeaders": [
      {
        "header": "X-Frame-Options",
        "operation": "remove"
      }
    ]
  }
}
```

#### Set Request Header

```json
{
  "id": 2,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://example.com/"
      }
    ]
  }
}
```

#### Append to Header

```json
{
  "id": 3,
  "action": {
    "type": "modifyHeaders",
    "responseHeaders": [
      {
        "header": "Set-Cookie",
        "operation": "append",
        "value": "SameSite=None; Secure"
      }
    ]
  }
}
```

**Header Operations:**

- `set` - Replace header value
- `append` - Add to existing value
- `remove` - Delete header

---

### 4. allow

Bypass other rules.

```json
{
  "id": 4,
  "priority": 10000,
  "action": { "type": "allow" },
  "condition": {
    "urlFilter": "https://trusted.example.com/*"
  }
}
```

**Use case:** Whitelist specific URLs from blocking rules

**We don't use this**

---

### 5. allowAllRequests

Disable all rules for a given request.

```json
{
  "id": 5,
  "action": { "type": "allowAllRequests" },
  "condition": {
    "urlFilter": "https://safe.example.com/*",
    "resourceTypes": ["main_frame"]
  }
}
```

**We don't use this**

---

### 6. upgradeScheme

Upgrade HTTP to HTTPS.

```json
{
  "id": 6,
  "action": { "type": "upgradeScheme" },
  "condition": {
    "urlFilter": "http://*"
  }
}
```

**Use case:** Force HTTPS

**We don't use this** (AI sites are already HTTPS)

---

## Condition Types

Conditions determine **when** a rule applies.

### 1. requestDomains

Match specific domains.

```json
"condition": {
  "requestDomains": [
    "chatgpt.com",
    "www.chatgpt.com"
  ]
}
```

**Matches:**

- `https://chatgpt.com/`
- `https://chatgpt.com/chat`
- `http://chatgpt.com/` (even HTTP)

**Does NOT match:**

- `https://auth.chatgpt.com/` (different subdomain)
- `https://chatgpt.com.evil.com/` (not the actual domain)

**Wildcard alternative:**
Can't use wildcards in `requestDomains`. Use `urlFilter` instead:

```json
"condition": {
  "urlFilter": "*://*.chatgpt.com/*"
}
```

---

### 2. urlFilter

Match URL patterns.

```json
"condition": {
  "urlFilter": "https://chatgpt.com/*"
}
```

**Patterns:**

- `*` - Any characters
- `|` - Anchor (start/end of URL)
- `||` - Domain anchor

**Examples:**

- `||example.com/*` - Any path on example.com
- `*://example.com/page*` - Any protocol
- `|https://example.com|` - Exact URL

**We mostly use requestDomains** (simpler, clearer)

---

### 3. resourceTypes

Match request types.

```json
"condition": {
  "resourceTypes": ["sub_frame"]
}
```

**Common types:**

- `main_frame` - Top-level page
- `sub_frame` - Iframe
- `stylesheet` - CSS files
- `script` - JavaScript files
- `image` - Images
- `font` - Fonts
- `xmlhttprequest` - AJAX requests
- `other` - Everything else

**Our usage:**

- **`sub_frame`** - Matches iframes (our LLM sites)
- **`other`** - Catch-all for edge cases

---

### 4. initiatorDomains

Match the domain that initiated the request.

```json
"condition": {
  "initiatorDomains": ["example.com"]
}
```

**Example:**
If `example.com` loads an image from `cdn.example.com`, the initiator is `example.com`.

**We don't use this** (we care about the request domain, not the initiator)

---

### 5. excludedRequestDomains

Exclude specific domains.

```json
"condition": {
  "urlFilter": "*",
  "excludedRequestDomains": ["trusted.com"]
}
```

**Use case:** "Match everything except X"

**We don't use this**

---

### 6. regexFilter

Advanced regex matching.

```json
"condition": {
  "regexFilter": "^https://example\\.com/(a|b)/.*$"
}
```

**Performance cost:**

- More expensive than simple filters
- Limited to 1,000 regex rules per extension
- Even simpler regexes incur overhead

**We don't use this** (simple filters are faster)

---

## Priority System

When multiple rules match the same request, Chrome applies them in **priority order**.

### Default Priority

```json
{
  "id": 1,
  // No priority specified = priority 1
  "action": { "type": "modifyHeaders", ... }
}
```

### Explicit Priority

```json
{
  "id": 2,
  "priority": 5000,
  "action": { "type": "modifyHeaders", ... }
}
```

### How Priorities Work

**Scenario:** Two rules match the same request

```json
// Rule A (priority 5000)
{
  "id": 1,
  "priority": 5000,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      { "header": "Referer", "operation": "set", "value": "default.com" }
    ]
  },
  "condition": {
    "requestDomains": ["example.com"]
  }
}

// Rule B (priority 5001)
{
  "id": 2,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      { "header": "Referer", "operation": "set", "value": "override.com" }
    ]
  },
  "condition": {
    "requestDomains": ["example.com"]
  }
}
```

**Result:** Rule B wins (higher priority). Referer is set to `override.com`.

### Our Priority Strategy

**Priority 5000:**

- General header stripping (CSP, X-Frame-Options, etc.)
- User-Agent modification
- Applies to all AI domains

**Priority 5001:**

- Domain-specific Referer/Origin overrides
- More specific than general rules

**Why this matters:**
If we set Referer at the same priority as header removal, the order is unpredictable. Higher priority ensures our domain-specific rules always apply.

---

## Rule Limits

Chrome enforces limits to prevent abuse:

| Limit Type               | Maximum               |
| ------------------------ | --------------------- |
| Static rules (total)     | 30,000                |
| Static rules per ruleset | No limit (just total) |
| Enabled rulesets         | 50                    |
| Dynamic rules            | 5,000                 |
| Session rules            | 5,000                 |
| Regex rules              | 1,000                 |

**Our usage:**

- **8 static rules** (way under the limit)
- **1 ruleset** (way under the limit)
- **No dynamic/session rules**

---

## Performance Characteristics

### Why DNR is Fast

1. **Compiled by Chrome:** Rules are parsed once at install time
2. **Native code:** Runs in the browser process (not JavaScript)
3. **Non-blocking:** Doesn't stop the browser from continuing to load
4. **Minimal overhead:** Simple condition matching (not complex scripts)

### Performance Comparison

**webRequest (Manifest V2):**

- Each request runs JavaScript code
- Can take 5-50ms per request
- Blocks page rendering

**declarativeNetRequest (Manifest V3):**

- Rules evaluated in native code
- Takes <1ms per request
- Doesn't block anything

**Real-world impact:**
On a page with 100 network requests:

- webRequest: 500-5000ms overhead
- DNR: <100ms overhead

---

## Debugging DNR Rules

### Check if Rules Are Loaded

```javascript
chrome.declarativeNetRequest.getEnabledRulesets((rulesets) => {
  console.log("Enabled rulesets:", rulesets);
});
```

### View Matched Rules (Debugging)

Chrome doesn't have a built-in UI for this, but you can:

1. **Check Network Tab:**
   - Open DevTools
   - Go to Network panel
   - Look for modified headers

2. **Test Specific Rules:**

   ```javascript
   chrome.declarativeNetRequest.testMatchOutcome(
     { url: "https://chatgpt.com", type: "sub_frame" },
     (result) => console.log(result),
   );
   ```

3. **Console Logging:**
   DNR doesn't have logging, but you can add logging to your background script when rules are loaded:
   ```javascript
   chrome.runtime.onInstalled.addListener(() => {
     console.log("Rules loaded from net_rules.json");
   });
   ```

---

## Common Patterns

### Pattern 1: Remove Security Headers

```json
{
  "id": 1,
  "action": {
    "type": "modifyHeaders",
    "responseHeaders": [
      { "header": "Content-Security-Policy", "operation": "remove" },
      { "header": "X-Frame-Options", "operation": "remove" }
    ]
  },
  "condition": {
    "requestDomains": ["example.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

**Use case:** Allow iframe embedding (what we do)

---

### Pattern 2: Spoof Referer

```json
{
  "id": 2,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://example.com/"
      },
      { "header": "Origin", "operation": "set", "value": "https://example.com" }
    ]
  },
  "condition": {
    "requestDomains": ["example.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

**Use case:** Bypass referer checks (what we do)

---

### Pattern 3: Block Unwanted Resources

```json
{
  "id": 3,
  "action": { "type": "block" },
  "condition": {
    "urlFilter": "*://ads.example.com/*"
  }
}
```

**Use case:** Ad blocking

---

### Pattern 4: Force HTTPS

```json
{
  "id": 4,
  "action": { "type": "upgradeScheme" },
  "condition": {
    "urlFilter": "http://*",
    "resourceTypes": ["main_frame"]
  }
}
```

**Use case:** Security enhancement

---

## Limitations

### What DNR Can't Do

1. **Access request/response bodies**
   - Can't read POST data
   - Can't modify HTML content
   - Can only work with headers and URLs

2. **Make runtime decisions**
   - All rules are static (declared upfront)
   - Can't say "if X then Y" in JavaScript
   - Dynamic rules are limited (5,000 max)

3. **Access cookie values**
   - Can append to Set-Cookie header
   - Can't read or modify cookie contents

4. **Complex logic**
   - No if/else, no loops, no functions
   - Only declarative matching

### When to Use Content Scripts Instead

If you need to:

- Modify page content (DOM manipulation)
- Read data from pages
- Inject UI elements
- Run complex JavaScript logic

→ Use **content scripts**, not DNR

**Our case:** We don't need any of these, so DNR is perfect.

---

## Best Practices

### 1. Use Specific Conditions

❌ Too broad:

```json
"condition": { "urlFilter": "*" }
```

✅ Specific:

```json
"condition": {
  "requestDomains": ["chatgpt.com"],
  "resourceTypes": ["sub_frame"]
}
```

### 2. Minimize Rule Count

Fewer rules = better performance.

- Combine similar rules when possible
- Use wildcards thoughtfully

### 3. Use Priority Strategically

- General rules: Lower priority
- Specific overrides: Higher priority

### 4. Test Thoroughly

- Test each rule individually
- Check for conflicts between rules
- Verify in different browsers (Chrome, Edge)

---

## DNR vs. Other Approaches

| Approach             | Pros                       | Cons                           |
| -------------------- | -------------------------- | ------------------------------ |
| **DNR**              | Fast, secure, non-blocking | Limited logic, static rules    |
| **webRequest**       | Full control, dynamic      | Slow, blocking, deprecated     |
| **Content Scripts**  | Full DOM access            | Can't modify headers, slower   |
| **Proxy Extensions** | Full network control       | Requires proxy server, complex |

**For Vantage LLM:** DNR is the perfect fit (fast, secure, does exactly what we need).

---

## Further Reading

### Official Documentation

- [declarativeNetRequest API](https://developer.chrome.com/docs/extensions/reference/declarativeNetRequest/)
- [Manifest V3 Migration](https://developer.chrome.com/docs/extensions/migrating/to-service-workers/)

### Samples

- [Chrome Extension Samples - DNR](https://github.com/GoogleChrome/chrome-extensions-samples/tree/main/functional-samples/reference.declarativeNetRequest)

---

## Next Steps

Now that you understand DNR, let's analyze our specific rules:

**→ Continue to [Network Rules Deep-Dive](05-Net-Rules-Explained.md)**

Or explore other components:

- [Background Script](06-Background-Script.md)
- [Sidebar UI](07-Sidebar-UI.md)

---

_Last Updated: February 6, 2026_
