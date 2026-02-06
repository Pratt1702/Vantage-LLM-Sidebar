# Network Rules Deep-Dive - Every Rule Explained

**Navigation:** [← DeclarativeNetRequest](04-DeclarativeNetRequest.md) | [Overview](00-Overview.md) | [Next: Background Script →](06-Background-Script.md)

---

## Our Complete net_rules.json

We have **8 rules** organized into **6 functional groups**:

| Rule ID | Priority | Purpose                                                  |
| ------- | -------- | -------------------------------------------------------- |
| 1       | 5000     | Remove all security headers (CSP, X-Frame-Options, etc.) |
| 10      | 5000     | Modify User-Agent and Client Hints                       |
| 20      | 5001     | Set Referer/Origin for Gemini                            |
| 30      | 5001     | Set Referer/Origin for ChatGPT                           |
| 40      | 5001     | Set Referer/Origin for Claude                            |
| 50      | 5001     | Set Referer/Origin for Perplexity                        |
| 60      | 5001     | Set Referer/Origin for AI Studio                         |
| 70      | 5001     | Set Referer/Origin for DeepSeek                          |
| 80      | 5001     | Set Referer/Origin for Google Accounts                   |

---

## Rule 1: Security Header Stripper

**Purpose:** Remove all security headers that prevent iframe embedding

```json
{
  "id": 1,
  "priority": 5000,
  "action": {
    "type": "modifyHeaders",
    "responseHeaders": [
      { "header": "X-Frame-Options", "operation": "remove" },
      { "header": "Content-Security-Policy", "operation": "remove" },
      {
        "header": "Content-Security-Policy-Report-Only",
        "operation": "remove"
      },
      { "header": "X-Content-Security-Policy", "operation": "remove" },
      { "header": "X-WebKit-CSP", "operation": "remove" },
      { "header": "Cross-Origin-Resource-Policy", "operation": "remove" },
      { "header": "Cross-Origin-Embedder-Policy", "operation": "remove" },
      { "header": "Cross-Origin-Opener-Policy", "operation": "remove" },
      { "header": "X-Content-Type-Options", "operation": "remove" },
      { "header": "Report-To", "operation": "remove" },
      { "header": "NEL", "operation": "remove" },
      {
        "header": "Set-Cookie",
        "operation": "append",
        "value": "SameSite=None; Secure"
      }
    ]
  },
  "condition": {
    "requestDomains": [
      "www.bing.com",
      "bing.com",
      "copilot.microsoft.com",
      "perplexity.ai",
      "www.perplexity.ai",
      "gemini.google.com",
      "aistudio.google.com",
      "accounts.google.com",
      "google.com",
      "www.google.com",
      "chatgpt.com",
      "claude.ai",
      "anthropic.com",
      "chat.deepseek.com",
      "deepseek.com"
    ],
    "resourceTypes": ["sub_frame", "other"]
  }
}
```

### Header-by-Header Breakdown

#### 1. `X-Frame-Options` - REMOVE

**What it does:**
Old-school header that prevents clickjacking.

**Common values:**

```http
X-Frame-Options: DENY
X-Frame-Options: SAMEORIGIN
```

**Why we remove it:**
`DENY` and `SAMEORIGIN` both prevent our extension from embedding the site.

**Real example:**
ChatGPT sends `X-Frame-Options: DENY`, blocking iframes completely.

---

#### 2. `Content-Security-Policy` - REMOVE

**What it does:**
Modern security header with fine-grained control.

**The killer directive:**

```http
Content-Security-Policy: frame-ancestors 'none'
```

**Why we remove it:**
`frame-ancestors 'none'` prevents ANY iframe embedding, even from the same origin.

**Real examples:**

- ChatGPT: `frame-ancestors 'none'`
- Perplexity: `frame-ancestors 'self' https://onedrive.live.com`
- Gemini accounts: `frame-ancestors https://gemini.google.com`

---

#### 3. `Content-Security-Policy-Report-Only` - REMOVE

**What it does:**
Test mode for CSP (logs violations instead of blocking).

**Why we remove it:**
Although it doesn't block, it can cause console errors and confusion. Better to remove it.

---

#### 4. `X-Content-Security-Policy` - REMOVE

**What it does:**
Legacy CSP header for old Firefox versions.

**Why we remove it:**
For completeness. Some services might still send it.

---

#### 5. `X-WebKit-CSP` - REMOVE

**What it does:**
Legacy CSP header for old Safari/WebKit browsers.

**Why we remove it:**
Thorough cleanup. Prevents edge cases with older rendering engines.

---

#### 6. `Cross-Origin-Resource-Policy` - REMOVE

**What it does:**
Controls who can load this resource.

**Values:**

```http
Cross-Origin-Resource-Policy: same-origin
Cross-Origin-Resource-Policy: same-site
Cross-Origin-Resource-Policy: cross-origin
```

**Why we remove it:**
`same-origin` can prevent resources from loading in our cross-origin iframe.

---

#### 7. `Cross-Origin-Embedder-Policy` - REMOVE

**What it does:**
Requires all embedded resources to explicitly allow being loaded.

**Values:**

```http
Cross-Origin-Embedder-Policy: require-corp
```

**Why we remove it:**
Can cause resources to fail loading in iframes. Safer to strip entirely.

---

#### 8. `Cross-Origin-Opener-Policy` - REMOVE

**What it does:**
Controls whether a window can access another window it opened.

**Values:**

```http
Cross-Origin-Opener-Policy: same-origin
```

**Why we remove it:**
Can interfere with popup windows and auth flows. Better to remove.

---

#### 9. `X-Content-Type-Options` - REMOVE

**What it does:**
Prevents MIME-type sniffing.

**Value:**

```http
X-Content-Type-Options: nosniff
```

**Why we remove it:**
Doesn't directly affect iframe embedding, but can cause issues with resource loading. Safest to remove.

---

#### 10. `Report-To` - REMOVE

**What it does:**
Tells the browser where to send security violation reports.

**Example:**

```http
Report-To: {"group":"default","max_age":86400,"endpoints":[{"url":"https://example.com/reports"}]}
```

**Why we remove it:**
We're intentionally violating security policies. No point in sending reports.

---

#### 11. `NEL` (Network Error Logging) - REMOVE

**What it does:**
Logs network errors to a server.

**Example:**

```http
NEL: {"report_to":"default","max_age":86400}
```

**Why we remove it:**
Related to `Report-To`. No need for error logging.

---

#### 12. `Set-Cookie` - APPEND

**What it does:**
Sets cookies for the domain.

**What we append:**

```http
Set-Cookie: [existing]; SameSite=None; Secure
```

**Why we modify it:**
By default, cookies use `SameSite=Lax` or `SameSite=Strict`, which don't work in cross-origin iframes. We force `SameSite=None; Secure` to ensure cookies (and thus login sessions) work.

**Critical for:**

- Keeping users logged into ChatGPT/Gemini
- Maintaining session state

---

### Condition Breakdown

```json
"condition": {
  "requestDomains": [...],
  "resourceTypes": ["sub_frame", "other"]
}
```

#### requestDomains

All the AI services and their related domains:

**ChatGPT:**

- `chatgpt.com`

**Google Services:**

- `gemini.google.com` - Gemini chat
- `aistudio.google.com` - AI Studio
- `accounts.google.com` - Google login (for Gemini)
- `google.com` - Generic Google resources
- `www.google.com` - Google homepage/resources

**Claude:**

- `claude.ai` - Claude chat
- `anthropic.com` - Anthropic resources (images, assets, etc.)

**Perplexity:**

- `perplexity.ai` - Without www
- `www.perplexity.ai` - With www (both needed!)

**DeepSeek:**

- `chat.deepseek.com` - DeepSeek chat
- `deepseek.com` - DeepSeek resources

**Microsoft (legacy, mostly unused now):**

- `www.bing.com` - Bing search
- `bing.com` - Bing without www
- `copilot.microsoft.com` - Copilot chat

#### resourceTypes

- **`sub_frame`** - Iframes (our primary use case)
- **`other`** - Catch-all for edge cases (XMLHttpRequest, etc.)

**Why both?**
Some resources loaded by the iframe might be classified as "other" rather than "sub_frame". Better to cover both.

---

## Rule 10: User-Agent Spoofing

**Purpose:** Pretend we're a standard Edge browser

```json
{
  "id": 10,
  "priority": 5000,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "User-Agent",
        "operation": "set",
        "value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0"
      },
      {
        "header": "Sec-Ch-Ua",
        "operation": "set",
        "value": "\"Not A(Brand\";v=\"99\", \"Microsoft Edge\";v=\"122\", \"Chromium\";v=\"122\""
      },
      {
        "header": "Sec-Ch-Ua-Mobile",
        "operation": "set",
        "value": "?0"
      },
      {
        "header": "Sec-Ch-Ua-Platform",
        "operation": "set",
        "value": "\"Windows\""
      }
    ]
  },
  "condition": {
    "requestDomains": [
      /* same list as Rule 1 */
    ],
    "resourceTypes": ["sub_frame"]
  }
}
```

### Header Breakdown

#### User-Agent

```
Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0
```

**Breakdown:**

- `Mozilla/5.0` - Legacy compatibility token (meaningless, but required)
- `Windows NT 10.0` - Windows 10
- `Win64; x64` - 64-bit architecture
- `AppleWebKit/537.36` - WebKit rendering engine version
- `Chrome/122.0.0.0` - Chromium version
- `Safari/537.36` - Safari compatibility layer
- `Edg/122.0.0.0` - Microsoft Edge identifier

**Why Edge instead of Chrome?**

- Microsoft Copilot might check for Edge
- Some Google services are more lenient with Edge
- Doesn't really matter—both are Chromium-based

#### Sec-Ch-Ua (Client Hints)

```
"Not A(Brand";v="99", "Microsoft Edge";v="122", "Chromium";v="122"
```

Modern replacement for User-Agent. Provides structured data about the browser.

**Breakdown:**

- `"Not A(Brand";v="99"` - Dummy entry to prevent sniffing based on alphabetical ordering
- `"Microsoft Edge";v="122"` - Edge version 122
- `"Chromium";v="122"` - Chromium version 122

#### Sec-Ch-Ua-Mobile

```
?0
```

Indicates desktop (not mobile).

**Values:**

- `?0` - Desktop
- `?1` - Mobile

#### Sec-Ch-Ua-Platform

```
"Windows"
```

Operating system.

**Other values:**

- `"macOS"`
- `"Linux"`
- `"Android"`
- `"iOS"`

### Why Spoof User-Agent?

**Problem:** Extensions might send slightly different User-Agent strings that some sites block.

**Solution:** Standardize on a common, stable User-Agent.

**Does it matter?** Probably not for most sites, but it's a safeguard.

---

## Rules 20-80: Domain-Specific Referer/Origin

These rules set `Referer` and `Origin` headers to match each service's own domain.

**Why this matters:**
Some sites check `Referer` and `Origin` to ensure requests are coming from themselves, not from third-party sites (CSRF protection).

**Our strategy:**
Make each site think the request is coming from itself.

---

### Rule 20: Gemini

```json
{
  "id": 20,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://gemini.google.com/"
      },
      {
        "header": "Origin",
        "operation": "set",
        "value": "https://gemini.google.com"
      }
    ]
  },
  "condition": {
    "requestDomains": ["gemini.google.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

**What it does:**
When loading `gemini.google.com`, pretend the request came from `https://gemini.google.com/`.

**Why priority 5001?**
Higher than Rule 10 (5000), ensuring this runs after User-Agent is set.

---

### Rule 30: ChatGPT

```json
{
  "id": 30,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://chatgpt.com/"
      },
      {
        "header": "Origin",
        "operation": "set",
        "value": "https://chatgpt.com"
      }
    ]
  },
  "condition": {
    "requestDomains": ["chatgpt.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

**Same strategy:** ChatGPT thinks the request came from itself.

---

### Rule 40: Claude

```json
{
  "id": 40,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://claude.ai/"
      },
      {
        "header": "Origin",
        "operation": "set",
        "value": "https://claude.ai"
      }
    ]
  },
  "condition": {
    "requestDomains": ["claude.ai", "anthropic.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

**Note:** Includes `anthropic.com` because Claude loads resources from there.

---

### Rule 50: Perplexity

```json
{
  "id": 50,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://www.perplexity.ai/"
      },
      {
        "header": "Origin",
        "operation": "set",
        "value": "https://www.perplexity.ai"
      }
    ]
  },
  "condition": {
    "requestDomains": ["perplexity.ai", "www.perplexity.ai"],
    "resourceTypes": ["sub_frame"]
  }
}
```

**Important:** Covers both `perplexity.ai` (without www) and `www.perplexity.ai` (with www).

**Referer uses www:** We set Referer to `https://www.perplexity.ai/` because that's the canonical URL.

---

### Rule 60: AI Studio

```json
{
  "id": 60,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://aistudio.google.com/"
      },
      {
        "header": "Origin",
        "operation": "set",
        "value": "https://aistudio.google.com"
      }
    ]
  },
  "condition": {
    "requestDomains": ["aistudio.google.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

**What is AI Studio?**
Google's experimental AI playground. We branded it "Nano Banana" in the UI.

---

### Rule 70: DeepSeek

```json
{
  "id": 70,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://chat.deepseek.com/"
      },
      {
        "header": "Origin",
        "operation": "set",
        "value": "https://chat.deepseek.com"
      }
    ]
  },
  "condition": {
    "requestDomains": ["chat.deepseek.com", "deepseek.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

**Covers:** Main chat domain and resource domain.

---

### Rule 80: Google Accounts

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

**Why this rule?**
When logging into Gemini, Google redirects to `accounts.google.com`. Without this rule, the login iframe fails.

**Recent addition:** Added to fix the "frame-ancestors" issue with Google login.

---

## Rule Execution Order

When you open ChatGPT in the sidebar, here's what happens:

### 1. Browser Makes Request

```http
GET https://chatgpt.com/ HTTP/1.1
```

### 2. Rule 10 Modifies Request Headers

```http
GET https://chatgpt.com/ HTTP/1.1
User-Agent: Mozilla/5.0 ... Edg/122.0.0.0
Sec-Ch-Ua: "Not A(Brand";v="99", "Microsoft Edge";v="122"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Windows"
```

### 3. Rule 30 Modifies Request Headers (Priority Wins)

```http
GET https://chatgpt.com/ HTTP/1.1
User-Agent: Mozilla/5.0 ... Edg/122.0.0.0
Referer: https://chatgpt.com/
Origin: https://chatgpt.com
(other headers from Rule 10)
```

### 4. Server Responds

```http
HTTP/1.1 200 OK
Content-Security-Policy: frame-ancestors 'none'
X-Frame-Options: DENY
Set-Cookie: session=abc123; SameSite=Strict
(HTML content)
```

### 5. Rule 1 Strips Response Headers

```http
HTTP/1.1 200 OK
Set-Cookie: session=abc123; SameSite=None; Secure
(HTML content, CSP and X-Frame-Options removed)
```

### 6. Browser Renders

No CSP violation! Iframe loads successfully.

---

## Testing Rules

### View Headers in DevTools

1. Open the sidebar
2. Right-click inside the iframe
3. Select "Inspect"
4. Go to **Network** tab
5. Reload the iframe
6. Click on the main document request
7. Check **Headers** section

**Look for:**

- Request headers: Referer, Origin, User-Agent
- Response headers: Should NOT see CSP, X-Frame-Options

---

## Maintenance

### Adding a New LLM

To add support for a new AI service (e.g., "NewLLM"):

#### 1. Add to Rule 1 domains:

```json
"requestDomains": [
  ...,
  "newllm.com"
]
```

#### 2. Add to Rule 10 domains:

```json
"requestDomains": [
  ...,
  "newllm.com"
]
```

#### 3. Create new Referer rule:

```json
{
  "id": 90,
  "priority": 5001,
  "action": {
    "type": "modifyHeaders",
    "requestHeaders": [
      {
        "header": "Referer",
        "operation": "set",
        "value": "https://newllm.com/"
      },
      {
        "header": "Origin",
        "operation": "set",
        "value": "https://newllm.com"
      }
    ]
  },
  "condition": {
    "requestDomains": ["newllm.com"],
    "resourceTypes": ["sub_frame"]
  }
}
```

#### 4. Update manifest.json:

```json
"host_permissions": [
  ...,
  "https://*.newllm.com/*"
]
```

#### 5. Update background.js (nuclear reset):

```javascript
const targets = [
  ...,
  "https://newllm.com"
];
```

#### 6. Update index.html (UI):

```html
<div class="option" data-value="https://newllm.com">NewLLM</div>
```

---

## Common Issues

### Issue 1: Site Still Won't Load

**Symptoms:**

```
Refused to frame 'https://example.com' because...
```

**Solutions:**

1. Check if domain is in Rule 1's `requestDomains`
2. Verify you reloaded the extension
3. Clear cache/service workers (our background.js should do this)
4. Check for subdomains (might need `auth.example.com`, `www.example.com`, etc.)

---

### Issue 2: Login Doesn't Work

**Symptoms:**
Logout immediately after login, or infinite redirect loops.

**Likely cause:**
Cookies aren't persisting due to `SameSite` restrictions.

**Solution:**
Ensure Rule 1 is appending `SameSite=None; Secure` to `Set-Cookie`.

---

### Issue 3: Resources Fail to Load

**Symptoms:**
Blank iframe, or missing images/CSS.

**Likely cause:**
Resources are hosted on different domains not in our rules.

**Solution:**

1. Open DevTools Network tab
2. Find the failing resource
3. Add its domain to Rule 1

**Example:**
Claude loads images from `cdn.anthropic.com`. We handle this by including `anthropic.com` in Rule 40.

---

## Performance Impact

**Q: Do these rules slow down browsing?**

**A:** No. Insignificant impact.

**Measurements:**

- Rule evaluation: <1ms per request
- Non-blocking (doesn't delay page load)
- Only affects requests to AI domains (not general browsing)

**Compared to Manifest V2 webRequest:**

- webRequest: 5-50ms overhead per request
- declarativeNetRequest: <1ms overhead

---

## Security Considerations

**Q: Is this safe?**

**A:** Yes, with caveats.

**What we're doing:**

- Bypassing security headers on specific domains
- Only for sites the user explicitly loads

**Risks:**

- If a site gets hacked, we've removed its clickjacking protection
- But: User is actively using the site anyway (no additional risk)

**What we're NOT doing:**

- Intercepting data
- Sending data to third parties
- Modifying page content

---

## Further Reading

- [HTTP Headers Reference](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers)
- [CSP Directives](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Content-Security-Policy)
- [DeclarativeNetRequest API](04-DeclarativeNetRequest.md)

---

## Next Steps

**→ Continue to [Background Script](06-Background-Script.md)**

Or explore other components:

- [Sidebar UI Architecture](07-Sidebar-UI.md)
- [Troubleshooting Guide](08-Troubleshooting.md)

---

_Last Updated: February 6, 2026_
