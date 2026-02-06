# Web Security Fundamentals

**Navigation:** [← Manifest Explained](02-Manifest-Explained.md) | [Overview](00-Overview.md) | [Next: DeclarativeNetRequest →](04-DeclarativeNetRequest.md)

---

## Why This Matters for Vantage LLM

Our extension's **entire purpose** is to bypass web security restrictions. To understand what we're doing, you need to understand what these security mechanisms are and why they exist.

**The fundamental problem:** Websites like ChatGPT, Gemini, and Claude **intentionally prevent** being embedded in iframes using security headers. Our extension removes those headers.

---

## Same-Origin Policy (SOP)

### What It Is

The **Same-Origin Policy** is the foundation of web security. It states:

> **Scripts on one website cannot access data from another website**

"Origin" = Protocol + Domain + Port

### Examples

| URL 1                       | URL 2                       | Same Origin?                |
| --------------------------- | --------------------------- | --------------------------- |
| `https://example.com/page1` | `https://example.com/page2` | ✅ Yes                      |
| `https://example.com`       | `http://example.com`        | ❌ No (different protocol)  |
| `https://example.com`       | `https://api.example.com`   | ❌ No (different subdomain) |
| `https://example.com:443`   | `https://example.com:8080`  | ❌ No (different port)      |

### Why It Exists

**Without SOP:**

```javascript
// evil.com could do this:
<iframe src="https://gmail.com"></iframe>
<script>
  // Read your emails!
  const emails = iframe.contentDocument.body.innerHTML;
  sendToAttacker(emails);
</script>
```

**With SOP:**

```javascript
// Blocked by browser
const doc = iframe.contentDocument;
// ❌ SecurityError: Blocked by Same-Origin Policy
```

### Impact on Our Extension

We embed AI websites in iframes:

```html
<iframe src="https://chatgpt.com"></iframe>
```

Because our extension origin (`chrome-extension://abc123...`) is different from ChatGPT's origin (`https://chatgpt.com`), SOP prevents us from:

- Accessing the iframe's DOM
- Reading content inside the iframe
- Injecting scripts into the iframe

**But:** We don't need to do any of that! We just want to **display** the site, not access its data. SOP doesn't prevent rendering in an iframe—that's where other security headers come in.

---

## Content Security Policy (CSP)

### What It Is

**Content Security Policy** is an HTTP header that tells the browser what content is allowed to load on a page.

### Example CSP Header

```http
Content-Security-Policy: default-src 'self'; script-src 'self' https://cdn.example.com
```

**Translation:**

- Only load resources from the same origin (`'self'`)
- Scripts can also come from `https://cdn.example.com`
- Everything else is blocked

### CSP Directives

Common directives:

| Directive             | Controls                                 |
| --------------------- | ---------------------------------------- |
| `default-src`         | Fallback for other directives            |
| `script-src`          | Where JavaScript can load from           |
| `style-src`           | Where CSS can load from                  |
| `img-src`             | Where images can load from               |
| `font-src`            | Where fonts can load from                |
| `connect-src`         | Where XHR/fetch can connect to           |
| `frame-src`           | What can be loaded in iframes            |
| **`frame-ancestors`** | **Who can embed THIS page in an iframe** |

### The `frame-ancestors` Directive

This is the **key directive** that blocks our extension.

**Example:**

```http
Content-Security-Policy: frame-ancestors 'self'
```

**Translation:**

> "This page can only be embedded in iframes on the same origin."

**Common values:**

- `'none'` - Cannot be embedded anywhere (not even same origin)
- `'self'` - Only same origin can embed
- `https://trusted.com` - Only specific domains can embed
- _No directive_ - Can be embedded anywhere

### Real-World Examples

#### ChatGPT

```http
Content-Security-Policy: frame-ancestors 'none'
```

**Translation:** "ChatGPT cannot be embedded in ANY iframe, period."

#### Perplexity

```http
Content-Security-Policy: frame-ancestors 'self' https://onedrive.live.com https://*.sharepoint.com
```

**Translation:** "Perplexity can only be embedded by itself, OneDrive, and SharePoint."

#### Google Accounts

```http
Content-Security-Policy: frame-ancestors https://gemini.google.com
```

**Translation:** "Google login can only be embedded by Gemini."

### How Chrome Enforces CSP

When you try to load a site in an iframe:

1. Browser fetches the page
2. Browser reads CSP headers
3. Browser checks if parent page is allowed
4. If not allowed → **Blocked!**

**Error message:**

```
Refused to frame 'https://chatgpt.com' because an ancestor violates the following Content Security Policy directive: "frame-ancestors 'none'".
```

### Our Solution

We use `declarativeNetRequest` to **remove CSP headers** before Chrome sees them:

```json
{
  "header": "Content-Security-Policy",
  "operation": "remove"
}
```

**Result:** Chrome never receives the CSP directive, so it doesn't block the iframe.

---

## X-Frame-Options Header

### What It Is

An older security header (pre-CSP) that also controls iframe embedding.

### Values

```http
X-Frame-Options: DENY
```

**Translation:** Cannot be embedded in any iframe.

```http
X-Frame-Options: SAMEORIGIN
```

**Translation:** Can only be embedded by the same origin.

```http
X-Frame-Options: ALLOW-FROM https://example.com
```

**Translation:** Can only be embedded by specific domain.
⚠️ **Deprecated** - Most browsers ignore this now

### Relationship to CSP

- **Older:** X-Frame-Options (2008)
- **Newer:** CSP `frame-ancestors` directive (2013)

**If both are present:**
CSP `frame-ancestors` takes precedence (X-Frame-Options is ignored).

**Why we still remove it:**
Some older services might only use X-Frame-Options, and it doesn't hurt to remove both.

### Our Solution

```json
{
  "header": "X-Frame-Options",
  "operation": "remove"
}
```

---

## Cross-Origin Resource Sharing (CORS)

### What It Is

CORS allows servers to specify which origins can make requests to them.

### The Problem

```javascript
// From https://mysite.com
fetch("https://api.example.com/data").then((res) => res.json());
```

**Without CORS:** Browser blocks the request
**With CORS:** Server responds with headers allowing the request

### CORS Headers

**Server response:**

```http
Access-Control-Allow-Origin: https://mysite.com
Access-Control-Allow-Credentials: true
Access-Control-Allow-Methods: GET, POST
```

**Translation:**

- `https://mysite.com` can make requests to this API
- Cookies/authentication can be included
- GET and POST methods are allowed

### Preflight Requests

For complex requests (POST with custom headers), browsers send a **preflight** OPTIONS request first:

```http
OPTIONS /api/data HTTP/1.1
Origin: https://mysite.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Content-Type
```

Server responds with allowed methods/headers, then the real request proceeds.

### Impact on Vantage LLM

We don't directly deal with CORS because:

- We're loading entire pages in iframes (not making fetch requests)
- The AI sites handle their own CORS internally

**But:** If we tried to make API calls to ChatGPT from our extension background script, we'd need host permissions and potentially CORS headers.

---

## Cross-Origin Policies (CORP, COEP, COOP)

Chrome introduced additional cross-origin isolation headers:

### Cross-Origin-Resource-Policy (CORP)

Controls which sites can load a resource.

```http
Cross-Origin-Resource-Policy: same-origin
```

**Values:**

- `same-origin` - Only same origin can load this resource
- `same-site` - Same site (including subdomains) can load
- `cross-origin` - Anyone can load

### Cross-Origin-Embedder-Policy (COEP)

Requires all resources to explicitly opt-in to being loaded.

```http
Cross-Origin-Embedder-Policy: require-corp
```

### Cross-Origin-Opener-Policy (COOP)

Controls whether a window can access another window it opened.

```http
Cross-Origin-Opener-Policy: same-origin
```

### Why We Remove These

These can interfere with iframe embedding and resource loading. While CSP and X-Frame-Options are the main blockers, these headers can cause subtle issues, so we remove them proactively:

```json
{
  "header": "Cross-Origin-Resource-Policy",
  "operation": "remove"
},
{
  "header": "Cross-Origin-Embedder-Policy",
  "operation": "remove"
},
{
  "header": "Cross-Origin-Opener-Policy",
  "operation": "remove"
}
```

---

## HTTP Referer and Origin Headers

### Referer Header (Request)

Tells the server which page you came from.

```http
Referer: https://google.com/search?q=cats
```

**Uses:**

- Analytics (where traffic comes from)
- Security (blocking hotlinking)
- CSRF protection

**Spelling note:** "Referer" is misspelled in the HTTP spec (should be "Referrer"), but it's too late to change.

### Origin Header (Request)

Similar to Referer, but simpler (just the origin).

```http
Origin: https://example.com
```

**Difference from Referer:**

- **Referer:** Full URL (with path)
- **Origin:** Just protocol + domain + port

### Why We Modify These

Some AI sites check the Referer/Origin to block requests from unknown sources.

**Example:**
Gemini might check:

```javascript
if (request.headers.get("Referer") !== "https://gemini.google.com/") {
  return 403; // Forbidden
}
```

**Our solution:**
Spoof the Referer/Origin to look like we're coming from the site itself:

```json
{
  "header": "Referer",
  "operation": "set",
  "value": "https://gemini.google.com/"
}
```

**Result:** Gemini thinks the request came from itself, not our extension.

---

## User-Agent Header

### What It Is

Identifies the browser/device making the request.

**Example:**

```http
User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36
```

**Breakdown:**

- **Mozilla/5.0** - Legacy compatibility token
- **Windows NT 10.0** - Operating system
- **AppleWebKit/537.36** - Rendering engine
- **Chrome/122.0.0.0** - Browser version
- **Safari/537.36** - Compatibility layer

### Why We Modify It

Some sites block unusual User-Agents (like Chrome extensions, which might have slightly different UA strings).

**Our solution:**
Set a standard Edge User-Agent:

```javascript
"value": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0"
```

**Why Edge instead of Chrome?**

- Some sites are more lenient with Edge
- Microsoft Copilot expects Edge UA
- Doesn't really matter for most sites

### Client Hints (Sec-CH-UA)

Modern browsers send additional "Client Hint" headers:

```http
Sec-Ch-Ua: "Not A(Brand";v="99", "Microsoft Edge";v="122"
Sec-Ch-Ua-Mobile: ?0
Sec-Ch-Ua-Platform: "Windows"
```

**We set these consistently with our User-Agent** to avoid detection.

---

## Cookies and SameSite Attribute

### SameSite Cookie Attribute

Cookies can specify when they should be sent:

```http
Set-Cookie: session=abc123; SameSite=Strict
```

**Values:**

- `SameSite=Strict` - Only sent on same-site requests
- `SameSite=Lax` - Sent on top-level navigations (clicking links)
- `SameSite=None; Secure` - Sent everywhere (requires HTTPS)

### The Problem for Iframes

When loading ChatGPT in an iframe:

- Parent: `chrome-extension://abc123...`
- Iframe: `https://chatgpt.com`

**Different origins!** So browsers block `SameSite=Strict` cookies.

### Our Solution

Force cookies to use `SameSite=None; Secure`:

```json
{
  "header": "Set-Cookie",
  "operation": "append",
  "value": "SameSite=None; Secure"
}
```

**Result:** Cookies work in the cross-origin iframe, keeping users logged in.

---

## Browser Security Features We Bypass

### Summary Table

| Security Feature        | Purpose                | How We Bypass       |
| ----------------------- | ---------------------- | ------------------- |
| **CSP frame-ancestors** | Prevent clickjacking   | Remove CSP headers  |
| **X-Frame-Options**     | Prevent clickjacking   | Remove header       |
| **Referer checks**      | Authenticate requests  | Spoof Referer       |
| **Origin checks**       | CSRF protection        | Spoof Origin        |
| **User-Agent blocking** | Block bots/scrapers    | Spoof User-Agent    |
| **SameSite cookies**    | CSRF protection        | Force SameSite=None |
| **CORP/COEP/COOP**      | Cross-origin isolation | Remove headers      |

---

## Ethical Considerations

### Why This Is Legitimate

1. **User control:** Users voluntarily install the extension
2. **Their own data:** Users access their own ChatGPT/Gemini accounts
3. **No data theft:** We don't intercept or steal data
4. **Convenience:** Just a different UI for the same services

### Why Sites Block Iframes

**Legitimate reasons:**

- **Clickjacking attacks:** Tricking users into clicking invisible iframes
- **Phishing:** Embedding login pages on malicious sites
- **Content theft:** Stealing content and pretending it's yours

**Our use case:**
We're not doing any of these malicious things—we're just providing a convenient sidebar.

### Legal Gray Area

Terms of Service for some AI platforms might prohibit this. But:

- We're not scraping or automating
- We're not bypassing paywalls
- Users still need valid accounts
- It's similar to using a different browser

---

## Security Headers We Remove

Our `net_rules.json` removes these headers:

1. **X-Frame-Options** - Prevent iframe embedding
2. **Content-Security-Policy** - Complex security rules
3. **Content-Security-Policy-Report-Only** - CSP in test mode
4. **X-Content-Security-Policy** - Legacy CSP header
5. **X-WebKit-CSP** - Safari-specific CSP
6. **Cross-Origin-Resource-Policy** - Resource isolation
7. **Cross-Origin-Embedder-Policy** - Embedding isolation
8. **Cross-Origin-Opener-Policy** - Window isolation
9. **X-Content-Type-Options** - MIME sniffing protection
10. **Report-To** - Security violation reporting
11. **NEL** - Network error logging

**Why remove them all?**
Better to be thorough. Removing unnecessary headers doesn't hurt, and it prevents subtle bugs.

---

## How Browsers Enforce Security

### Request/Response Flow

1. **User clicks on iframe**

   ```javascript
   <iframe src="https://chatgpt.com"></iframe>
   ```

2. **Browser sends request**

   ```http
   GET / HTTP/1.1
   Host: chatgpt.com
   Origin: chrome-extension://abc123
   ```

3. **Our extension intercepts** (via declarativeNetRequest)
   - Modify request headers (Referer, User-Agent)
   - Strip response headers (CSP, X-Frame-Options)

4. **Server responds** (modified by our extension)

   ```http
   HTTP/1.1 200 OK
   (CSP headers removed by us)
   ```

5. **Browser renders** (no CSP violations, iframe loads successfully)

---

## Tools for Inspecting Security Headers

### Chrome DevTools

**Network tab:**

1. Open DevTools (F12)
2. Go to Network tab
3. Reload page
4. Click on request
5. See "Headers" → "Response Headers"

**Example:**

```
content-security-policy: frame-ancestors 'none'
x-frame-options: DENY
```

### Online Tools

- [Security Headers](https://securityheaders.com/) - Analyze any website
- [CSP Evaluator](https://csp-evaluator.withgoogle.com/) - Check CSP syntax

### Browser Extensions

- [HTTP Header Live](https://chrome.google.com/webstore/detail/http-header-live/) - View headers in real-time

---

## Further Reading

### Official Specs

- [CSP Specification](https://www.w3.org/TR/CSP3/)
- [CORS Specification](https://fetch.spec.whatwg.org/#http-cors-protocol)
- [Same-Origin Policy](https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy)

### Guides

- [MDN Web Security](https://developer.mozilla.org/en-US/docs/Web/Security)
- [OWASP Security Headers](https://owasp.org/www-project-secure-headers/)

### Tools

- [Content-Security-Policy.com](https://content-security-policy.com/)

---

## Next Steps

Now that you understand web security, let's see how we bypass it with declarativeNetRequest:

**→ Continue to [DeclarativeNetRequest API](04-DeclarativeNetRequest.md)**

Or dive into our specific rules:

- [Network Rules Deep-Dive](05-Net-Rules-Explained.md)

---

_Last Updated: February 6, 2026_
