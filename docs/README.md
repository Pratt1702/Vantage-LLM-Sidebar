# Documentation Quick Reference

**Created:** February 6, 2026

---

## What's Inside

You now have **9+ comprehensive documentation files** covering every aspect of Vantage LLM Sidebar, from beginner concepts to expert-level implementation details.

**Total:** ~50,000+ words of documentation

---

## Reading Order

### 🎯 For Complete Beginners

**Start here if you've never built a Chrome extension:**

1. **[00-Overview.md](00-Overview.md)** - Navigation hub
2. **[01-Chrome-Extension-Basics.md](01-Chrome-Extension-Basics.md)** - Fundamentals
3. **[03-Web-Security-Fundamentals.md](03-Web-Security-Fundamentals.md)** - Security concepts
4. **[02-Manifest-Explained.md](02-Manifest-Explained.md)** - Line-by-line manifest breakdown

**Time:** ~2-3 hours to read and understand

---

### 🔧 For Understanding the Technical Implementation

**If you want to know HOW it works:**

1. **[04-DeclarativeNetRequest.md](04-DeclarativeNetRequest.md)** - Core API
2. **[05-Net-Rules-Explained.md](05-Net-Rules-Explained.md)** - Every rule explained
3. **[06-Background-Script.md](06-Background-Script.md)** - Service worker
4. **[07-Sidebar-UI.md](07-Sidebar-UI.md)** - HTML/CSS/JS frontend

**Time:** ~3-4 hours to master

---

### 🚀 For Maintaining & Publishing

**If you want to release and maintain the extension:**

1. **[08-Troubleshooting.md](08-Troubleshooting.md)** - Fix common issues
2. **[09-Publishing-Guide.md](09-Publishing-Guide.md)** - Release to Chrome Web Store

**Time:** ~1-2 hours to prepare for launch

---

## Quick Lookup Table

| I want to...                            | Read this                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------ |
| Understand what Chrome extensions are   | [01-Chrome-Extension-Basics.md](01-Chrome-Extension-Basics.md)                 |
| Learn about CSP, CORS, X-Frame-Options  | [03-Web-Security-Fundamentals.md](03-Web-Security-Fundamentals.md)             |
| Understand every field in manifest.json | [02-Manifest-Explained.md](02-Manifest-Explained.md)                           |
| Learn how declarativeNetRequest works   | [04-DeclarativeNetRequest.md](04-DeclarativeNetRequest.md)                     |
| Understand every rule in net_rules.json | [05-Net-Rules-Explained.md](05-Net-Rules-Explained.md)                         |
| Understand background.js                | [06-Background-Script.md](06-Background-Script.md)                             |
| Understand the HTML/CSS/JS UI           | [07-Sidebar-UI.md](07-Sidebar-UI.md)                                           |
| Fix a bug or issue                      | [08-Troubleshooting.md](08-Troubleshooting.md)                                 |
| Publish to Chrome Web Store             | [09-Publishing-Guide.md](09-Publishing-Guide.md)                               |
| Add a new LLM                           | [05-Net-Rules-Explained.md#maintenance](05-Net-Rules-Explained.md#maintenance) |

---

## What You'll Learn

### Core Concepts

✅ **Chrome Extension Architecture**

- Manifest files
- Service workers vs background pages
- Content scripts vs declarativeNetRequest
- Extension lifecycle

✅ **Web Security**

- Content Security Policy (CSP)
- Same-Origin Policy
- X-Frame-Options
- CORS
- Cookie SameSite attribute
- Referer/Origin headers

✅ **DeclarativeNetRequest API**

- Rule types (block, redirect, modifyHeaders)
- Conditions (domains, URLs, resource types)
- Priorities
- Performance characteristics

✅ **Network Headers**

- Request headers (User-Agent, Referer, Origin)
- Response headers (CSP, X-Frame-Options, Set-Cookie)
- Why we modify each one

### Implementation Details

✅ **Every File Explained**

- `manifest.json` - Configuration
- `net_rules.json` - Network rules (8 rules, line-by-line)
- `background.js` - Service worker logic
- `index.html` - UI structure
- `style.css` - Glassmorphic design
- `script.js` - Dropdown & iframe logic

✅ **Why We Made Each Decision**

- Priority 5000 vs 5001
- Edge User-Agent instead of Chrome
- Both `perplexity.ai` and `www.perplexity.ai`
- Nuclear reset on installation
- SameSite=None; Secure for cookies

### Practical Skills

✅ **Debugging**

- Chrome DevTools for extensions
- Service worker console
- Network tab analysis
- Storage inspection

✅ **Publishing**

- Chrome Web Store submission
- Privacy policy creation
- Screenshot preparation
- Handling review feedback

✅ **Maintenance**

- Adding new LLMs
- Updating rules
- Handling site changes
- Version management

---

## Documentation Features

### 📝 Written for Zero Knowledge

Every document assumes **no prior knowledge** and builds up from first principles.

**Example:**
Instead of "Use DNR to strip CSP headers," we explain:

1. What CSP is
2. Why it blocks iframes
3. What DNR is
4. How to use it
5. Why it's better than alternatives
6. Common pitfalls

### 💻 Code Snippets Everywhere

Every concept is illustrated with **actual code** from the project.

**Example:**

```json
{
  "header": "Content-Security-Policy",
  "operation": "remove"
}
```

With explanation of what each field does.

### 🔗 Interlinked

Documents reference each other extensively.

**Example:**
"Learn more about CSP in [Web Security Fundamentals](03-Web-Security-Fundamentals.md)"

### 📚 Real-World Examples

Every feature is explained with **practical examples**.

**Example:**
Not just "CSP prevents iframe embedding," but:

- ChatGPT's actual CSP: `frame-ancestors 'none'`
- The error message you see
- How our rule fixes it
- What happens if you don't fix it

### ✅ Best Practices

Each document includes **dos and don'ts**.

**Example:**

```javascript
❌ localStorage.setItem('key', 'value')  // Doesn't work in service workers
✅ chrome.storage.local.set({ key: 'value' })  // Correct approach
```

---

## File Sizes

| File                            | Lines | Content                |
| ------------------------------- | ----- | ---------------------- |
| 00-Overview.md                  | ~100  | Navigation hub         |
| 01-Chrome-Extension-Basics.md   | ~550  | Extension fundamentals |
| 02-Manifest-Explained.md        | ~650  | Manifest deep-dive     |
| 03-Web-Security-Fundamentals.md | ~750  | Security concepts      |
| 04-DeclarativeNetRequest.md     | ~750  | DNR API guide          |
| 05-Net-Rules-Explained.md       | ~900  | Rules explained        |
| 06-Background-Script.md         | ~650  | Service worker         |
| 07-Sidebar-UI.md                | ~850  | UI architecture        |
| 08-Troubleshooting.md           | ~700  | Issues & solutions     |
| 09-Publishing-Guide.md          | ~850  | Release guide          |

**Total:** ~6,750 lines / ~50,000 words

---

## How to Use This Documentation

### As a Learning Resource

1. **Read sequentially** (Overview → Basics → Security → Technical)
2. **Take notes** on concepts you find confusing
3. **Try examples** in your own test extension
4. **Refer back** when implementing features

### As a Reference

1. **Use the Overview** as a navigation hub
2. **Search for keywords** (Ctrl+F in files)
3. **Jump to specific sections** via table of contents
4. **Check Troubleshooting** when stuck

### For Team Members

1. **Share the Overview** with new developers
2. **Assign specific docs** based on their role:
   - Frontend devs → Sidebar UI
   - Security → Web Security Fundamentals
   - DevOps → Publishing Guide
3. **Use as onboarding material**

---

## Maintaining This Documentation

### When to Update

**Update docs when:**

- Adding new features (new LLMs, settings, etc.)
- Changing implementation (different API, architecture)
- Fixing bugs (add to troubleshooting)
- Publishing updates (new version in publishing guide)

### How to Update

1. **Find the relevant doc** (e.g., adding new LLM → Net Rules Explained)
2. **Edit the markdown file**
3. **Update "Last Updated" date** at the bottom
4. **Keep consistency** with existing style and tone

### Version Control

**Track documentation versions:**

```
docs/
├── CHANGELOG-DOCS.md  (document changes)
└── [all .md files]
```

**Example CHANGELOG-DOCS.md:**

```markdown
# Documentation Changelog

## 2026-02-06 - Initial Creation

Created comprehensive documentation suite (9 files, 50k+ words)

## 2026-02-15 - Added New LLM Section

Updated 05-Net-Rules-Explained.md with instructions for adding Llama
```

---

## Contributing

If someone wants to improve the docs:

1. **Submit an issue** with suggestions
2. **Fork the repo** and make changes
3. **Submit a pull request** with:
   - What you changed
   - Why (fix typo, clarify concept, add example)
   - Which files were modified

**Guidelines:**

- Keep the same tone (friendly, educational)
- Add code examples where helpful
- Update table of contents if adding sections
- Check for typos and grammar

---

## External Resources

**These docs are comprehensive, but you might also want:**

- [Official Chrome Extension Docs](https://developer.chrome.com/docs/extensions/)
- [MDN Web Docs](https://developer.mozilla.org/en-US/) - HTML/CSS/JS reference
- [Stack Overflow](https://stackoverflow.com/questions/tagged/google-chrome-extension)
- [Reddit r/chrome_extensions](https://reddit.com/r/chrome_extensions)

---

## Feedback

**Found an error? Have a suggestion?**

- Open an issue on GitHub
- Email: [shelfscape@shelfscape.app]
- Or submit a pull request

**We appreciate:**

- Typo fixes
- Clarifications
- Additional examples
- Better explanations

---

## What's Not Covered Here

**Out of scope (intentionally):**

- Advanced Chrome APIs (alarms, notifications, etc.) - We don't use them
- Backend integration - This is a frontend-only extension
- Monetization implementation - Only discussed conceptually
- Advanced JavaScript patterns - Kept simple for clarity
- Testing/CI/CD - Future docs if needed

**If you need these topics:**
Check official Chrome docs or request specific guides.

---

## License

Documentation is released under **CC BY 4.0** (Creative Commons Attribution).

**You can:**

- Share and adapt the docs
- Use for commercial purposes
- Create derivative works

**You must:**

- Give attribution
- Link to original source
- Indicate if changes were made

---

## Conclusion

**You now have everything you need to:**

- ✅ Understand Chrome extensions from scratch
- ✅ Master every technical detail of Vantage LLM
- ✅ Debug and fix any issue
- ✅ Publish to Chrome Web Store
- ✅ Maintain and extend the project
- ✅ Become a Chrome extension expert

**Happy reading!** 📚

Start with **[00-Overview.md](00-Overview.md)** and dive in.

---

_Documentation created: February 6, 2026_
_Last updated: February 6, 2026_
