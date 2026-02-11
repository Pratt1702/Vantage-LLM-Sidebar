# Vantage LLM Sidebar - Complete Documentation

**Welcome to the complete technical documentation for Vantage LLM Sidebar!** This guide will take you from zero knowledge to expert-level understanding of Chrome extensions and this specific project.

## 📚 Documentation Structure

This documentation is organized into modules, each covering a specific aspect of the extension:

### Part 1: Foundations

1. **[Chrome Extension Basics](01-Chrome-Extension-Basics.md)** - Start here if you're new to extensions
   - What Chrome extensions are
   - Extension architecture & components
   - Manifest V3 vs V2
   - Development workflow

2. **[Web Security Fundamentals](03-Web-Security-Fundamentals.md)** - Essential security concepts
   - Content Security Policy (CSP)
   - X-Frame-Options & frame-ancestors
   - CORS (Cross-Origin Resource Sharing)
   - Same-Origin Policy
   - Why websites block iframes

### Part 2: Project Deep-Dive

3. **[Manifest Explained](02-Manifest-Explained.md)** - Line-by-line breakdown
   - Every field in manifest.json
   - Permissions & why we need them
   - Host permissions explained
   - Commands & keyboard shortcuts

4. **[DeclarativeNetRequest API](04-DeclarativeNetRequest.md)** - The core technology
   - What DNR is and why it exists
   - How it differs from webRequest
   - Rule types and priorities
   - Performance implications

5. **[Network Rules Deep-Dive](05-Net-Rules-Explained.md)** - Our specific implementation
   - Every rule in net_rules.json explained
   - Header manipulation strategies
   - Why each header matters
   - Domain-specific overrides

6. **[Background Script](06-Background-Script.md)** - Service worker logic
   - What service workers are
   - Side panel behavior
   - Nuclear reset strategy
   - Command handling

7. **[Sidebar UI Architecture](07-Sidebar-UI.md)** - Frontend implementation
   - HTML structure
   - CSS glassmorphism design
   - JavaScript functionality
   - Chrome Storage API

### Part 3: Advanced Topics

8. **[Troubleshooting Guide](08-Troubleshooting.md)** - Common issues & solutions
   - CSP violations
   - Login issues
   - Debugging techniques
   - Performance optimization

9. **[Publishing Guide](09-Publishing-Guide.md)** - Release to production
   - Chrome Web Store submission
   - Edge Add-ons store
   - Version management
   - Privacy policy requirements

## 🎯 Project Overview

**Vantage LLM Sidebar** is a Chrome extension that embeds multiple AI chatbots (ChatGPT, Claude, Gemini, Perplexity, DeepSeek, Kimi) into a minimal sidebar.

### The Core Challenge

Websites like ChatGPT and Gemini actively **prevent** being embedded in iframes using security headers. This extension uses Chrome's **DeclarativeNetRequest API** to strip those security headers, allowing the sites to load in our sidebar.

### Key Technologies

- **Manifest V3** - Chrome's latest extension platform
- **DeclarativeNetRequest** - Header manipulation without blocking main thread
- **Side Panel API** - Native Chrome sidebar integration
- **Service Workers** - Background script execution
- **Chrome Storage API** - User preference persistence

## 🗂️ Project File Structure

```
Vantage-LLM-Sidebar/
├── manifest.json           # Extension configuration (the brain)
├── net_rules.json         # Network rules for header stripping
├── background.js          # Service worker (background logic)
├── index.html             # Sidebar UI structure
├── style.css              # Glassmorphic design
├── script.js              # Sidebar functionality
├── icon*.png              # Extension icons
├── docs/                  # This documentation
├── README.md              # Public-facing description
├── PRIVACY.md             # Privacy policy
└── LICENSE                # MIT license

```

## 🚀 Quick Start for Reading

**If you're completely new:**

1. Start with [Chrome Extension Basics](01-Chrome-Extension-Basics.md)
2. Then read [Web Security Fundamentals](03-Web-Security-Fundamentals.md)
3. Move to [Manifest Explained](02-Manifest-Explained.md)

**If you understand extensions but not this project:**

1. Read [DeclarativeNetRequest API](04-DeclarativeNetRequest.md)
2. Dive into [Network Rules Deep-Dive](05-Net-Rules-Explained.md)
3. Review [Background Script](06-Background-Script.md)

**If you want to modify/extend:**

1. Read [Sidebar UI Architecture](07-Sidebar-UI.md)
2. Check [Troubleshooting Guide](08-Troubleshooting.md)
3. Review [Publishing Guide](09-Publishing-Guide.md) for release

## 💡 Learning Path

Each document builds on the previous ones, but you can also jump to specific topics. All documents include:

- **Concepts** - Theoretical understanding
- **Code Examples** - Practical implementation
- **Why We Did It** - Decision rationale
- **Common Pitfalls** - What to avoid
- **Further Reading** - External resources

## 📖 Documentation Standards

Throughout these docs:

- `Code snippets` are highlighted
- **Important concepts** are bolded
- _Technical terms_ are italicized on first use
- 🔗 Links provide additional context
- ⚠️ Warnings highlight gotchas
- 💡 Tips provide best practices

---

**Ready to become an expert?** Head to [Chrome Extension Basics](01-Chrome-Extension-Basics.md) to begin!

_Last Updated: February 11, 2026_
