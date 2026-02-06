# Publishing Guide

**Navigation:** [← Troubleshooting](08-Troubleshooting.md) | [Back to Overview](00-Overview.md)

---

## Overview

This guide covers **everything** you need to publish Vantage LLM Sidebar to:

- **Chrome Web Store** (primary)
- **Microsoft Edge Add-ons** (secondary)
- **Other platforms** (if desired)

---

## Pre-Publishing Checklist

### 1. Version Number

**Update version in manifest.json:**

```json
{
  "version": "1.0.0" // Increment for each release
}
```

**Semantic versioning:**

- `1.0.0` - First stable release
- `1.0.1` - Bug fixes
- `1.1.0` - New features (backward compatible)
- `2.0.0` - Breaking changes

**Also update in index.html:**

```html
<span class="version">v1.0.0</span>
```

---

### 2. Icon Optimization

**Current issue:** Icons are 2MB+ (way too large)

**Optimize:**

1. **Resize properly:**
   - `icon16.png` → 16x16 pixels
   - `icon48.png` → 48x48 pixels
   - `icon128.png` → 128x128 pixels

2. **Compress:**
   - Use [TinyPNG](https://tinypng.com/)
   - Target: <50KB per icon

3. **Verify:**
   ```bash
   # Check file sizes (PowerShell)
   Get-ChildItem icon*.png | Select-Object Name, Length
   ```

---

### 3. Privacy Policy

**Required by Chrome Web Store if you:**

- Collect user data
- Use analytics
- Access host permissions

**Our case:**
We request `host_permissions`, so we need a privacy policy.

**Current PRIVACY.md:**

```markdown
# Privacy Policy for Vantage LLM - Your AI Sidebar

**Last Updated:** February 6, 2026

## Data Collection

Vantage LLM does NOT collect, store, or transmit any personal data.

## Permissions Explained

- **sidePanel:** Display the sidebar UI
- **declarativeNetRequest:** Modify headers to allow iframe embedding
- **storage:** Save your LLM preference locally
- **browsingData:** Clear cache on install (for AI domains only)
- **host_permissions:** Access AI websites to load them in sidebar

## Third-Party Services

The extension loads third-party websites (ChatGPT, Gemini, etc.) in iframes.
We do NOT access, read, or modify content within those iframes.
Any data you enter on those sites is subject to their own privacy policies.

## Changes

We may update this policy. Changes will be reflected in the extension listing.

## Contact

For questions: [your-email@example.com]
```

**Host it online:**

- Upload to GitHub Pages
- Or host on your own domain (e.g., `https://shelfscape.app/vantage/privacy`)

**Required fields:**

- What data is collected
- How it's used
- Contact information

---

### 4. README.md

**Update README with:**

- Clear description
- Screenshots
- Installation instructions
- Features list

**Example:**

```markdown
# Vantage LLM - Your AI Sidebar

Access ChatGPT, Gemini, Claude, Perplexity, and DeepSeek in a beautiful glassmorphic sidebar.

## Features

- 🎨 Glassmorphic design
- ⚡ Fast and lightweight
- 🔒 Privacy-focused (no data collection)
- ⌨️ Keyboard shortcut (Ctrl+Space)
- 💾 Remembers your preferred LLM

## Installation

[Download from Chrome Web Store](#) or [Install manually](#)

## Screenshots

![Screenshot](screenshot.png)
```

---

### 5. Screenshots & Promotional Images

**Required for Chrome Web Store:**

- **Small promotional tile:** 440x280 pixels
- **Screenshots:** At least 1 (1280x800 or 640x400)
- **Optional:** Marquee (1400x560), large tile (920x680)

**Capture screenshots:**

1. Open sidebar with ChatGPT loaded
2. Use Snipping Tool (Windows) or Screenshot tool (Mac)
3. Crop to show the sidebar clearly
4. Highlight key features (dropdown, glassmorphic footer)

---

### 6. Create ZIP Package

**Include files:**

```
vantage-llm-sidebar-v1.0.0.zip
├── manifest.json
├── background.js
├── index.html
├── script.js
├── style.css
├── net_rules.json
├── icon16.png
├── icon48.png
├── icon128.png
├── README.md
├── PRIVACY.md
└── LICENSE
```

**EXCLUDE:**

- `.git/` directory
- `_metadata/` directory (Chrome auto-generates this)
- `node_modules/` (if you have any)
- `.DS_Store` (Mac)
- `Thumbs.db` (Windows)
- Any development files

**Create ZIP (PowerShell):**

```powershell
# Create clean directory
$files = @(
  "manifest.json",
  "background.js",
  "index.html",
  "script.js",
  "style.css",
  "net_rules.json",
  "icon16.png",
  "icon48.png",
  "icon128.png",
  "README.md",
  "PRIVACY.md",
  "LICENSE"
)

# Create ZIP
Compress-Archive -Path $files -DestinationPath "vantage-llm-sidebar-v1.0.0.zip" -Force
```

**Verify ZIP:**
Extract it and load as unpacked extension to test.

---

## Chrome Web Store Submission

### Step 1: Create Developer Account

1. **Go to:** [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole)
2. **Sign in** with Google account
3. **Pay registration fee:** $5 (one-time, lifetime access)
4. **Complete developer account setup**

**Payment methods:**

- Most credit cards work
- If Indian cards fail, try:
  - PayPal (if available)
  - International credit card (Visa/Mastercard)
  - Different card (some banks block Google payments)

**Common error code 2201:**
"Your purchase could not be completed"

**Solutions:**

- Enable international transactions on your card
- Use a different payment method
- Contact your bank

---

### Step 2: Choose Account Type

**Two options:**

#### Individual

- **For:** Personal projects, sole developers
- **Name shown:** Your personal name or chosen developer name (e.g., "Shelfscape")
- **Verification:** Email only
- **Best for:** Your case (publishing under "Shelfscape" brand)

#### Company

- **For:** Registered businesses
- **Name shown:** Company name
- **Verification:** Business documents required
- **Best for:** Actual companies

**Our recommendation:** Individual, listed as "Shelfscape"

---

### Step 3: Upload Extension

1. **Click "New Item"**
2. **Upload ZIP:** Select `vantage-llm-sidebar-v1.0.0.zip`
3. **Wait for upload** (usually <1 minute)

**Validation:**
Chrome automatically validates your manifest and code.

**Common warnings:**

```
Warning: 'declarativeNetRequest' permission is powerful.
Ensure you justify its use in the description.
```

**What to do:**

- Explain in the description why you need each permission
- Example: "We use declarativeNetRequest to allow AI sites to load in the sidebar"

---

### Step 4: Fill Out Store Listing

#### Basic Info

**Extension name:**

```
Vantage LLM - Your AI Sidebar
```

**Summary (132 chars max):**

```
Access ChatGPT, Gemini, Claude, Perplexity & DeepSeek in a beautiful glassmorphic sidebar. Privacy-focused. No data collection.
```

**Description (16,000 chars max):**

```
Vantage LLM brings your favorite AI chatbots into a convenient, professional sidebar.

🎯 SUPPORTED LLMs:
• ChatGPT (OpenAI)
• Gemini (Google)
• Claude (Anthropic)
• Perplexity
• DeepSeek
• AI Studio (Google's Nano Banana)

✨ FEATURES:
• Beautiful glassmorphic design
• Fast and lightweight
• Quick switch between LLMs
• Keyboard shortcut (Ctrl+Space / Cmd+Space on Mac)
• Remembers your preferred LLM
• No data collection - completely private

🔒 PRIVACY:
We do NOT collect, store, or transmit any personal data.
The extension only modifies network headers to allow AI sites to load in the sidebar.
Your conversations remain private between you and the AI services.

🚀 HOW TO USE:
1. Click the extension icon or press Ctrl+Space
2. Select your preferred LLM from the dropdown
3. Start chatting!

💡 WHY VANTAGE?
Stop switching tabs! Keep your AI assistant always accessible in the sidebar while you browse.

📝 PERMISSIONS EXPLAINED:
• sidePanel: Display the sidebar interface
• declarativeNetRequest: Modify headers to allow embedding (removes CSP/X-Frame-Options)
• storage: Save your LLM preference
• browsingData: Clear cache on install for smooth operation
• host_permissions: Access AI websites to load them in sidebar

❤️ BUILT BY SHELFSCAPE
Created with love to help people work more efficiently.
```

**Category:**

- **Productivity** (primary)

**Language:**

- English

---

#### Privacy Practices

**Single purpose description:**

```
Provides quick access to multiple AI chatbots (ChatGPT, Gemini, Claude, etc.) in a sidebar interface.
```

**Justifications for permissions:**

**sidePanel:**

```
Required to create the native Chrome sidebar interface where AI chatbots are displayed.
```

**declarativeNetRequest:**

```
Required to modify HTTP headers (remove CSP and X-Frame-Options) so AI websites can load in the sidebar. Without this, sites like ChatGPT block iframe embedding.
```

**storage:**

```
Required to remember which LLM the user last selected, so their preference persists between sessions.
```

**browsingData:**

```
Required to clear cached security headers on installation, ensuring the extension works immediately without requiring manual cache clearing.
```

**host_permissions (remote code):**

```
We load third-party AI websites (ChatGPT, Gemini, etc.) in iframes. We do NOT access or modify the content within these iframes - we only modify headers to allow embedding. No remote code is executed by our extension.
```

**Do you sell user data?**
❌ No

**Use of personal or sensitive data:**
❌ None (we don't collect any data)

**Privacy policy URL:**

```
https://github.com/yourusername/vantage-llm-sidebar/blob/main/PRIVACY.md
```

(Or wherever you host it)

---

#### Store Listing Assets

**Icon:**
128x128 PNG (upload `icon128.png`)

**Screenshots (at least 1):**

- **1280x800** or **640x400** recommended
- Show the sidebar with ChatGPT/Gemini loaded
- Highlight the dropdown and features

**Promotional images (optional but recommended):**

**Small tile (440x280):**
Use a design tool (Figma, Canva) to create an attractive tile showing:

- Extension name
- Key features (icons or text)
- Screenshot preview

**Marquee (1400x560):**
Large banner for featured extensions (Chrome rarely features new extensions, but worth having).

---

#### Distribution

**Visibility:**

- ✅ Public (anyone can install)
- ❌ Unlisted (only people with direct link)
- ❌ Private (only specific users/groups)

**Regions:**

- ✅ All regions (unless you have legal restrictions)

**Pricing:**

- ✅ Free

---

### Step 5: Review & Submit

1. **Preview listing:** Click "Preview" to see how it looks
2. **Review all fields:** Double-check for typos
3. **Submit for review:** Click "Submit for review"

**Review time:**

- **Typical:** 1-3 days
- **Can take:** Up to 14 days for complex extensions
- **Might be faster:** If it's a simple extension with clear purpose

**What reviewers check:**

- Manifest validity
- Permissions justified
- Privacy policy present
- No malicious code
- Description matches functionality

---

### Step 6: Handle Review Feedback

**Possible outcomes:**

#### ✅ Approved

Extension goes live! Users can install it.

#### ⚠️ Needs Changes

Reviewers request modifications.

**Common requests:**

- "Clarify why you need X permission"
- "Update privacy policy to mention Y"
- "Provide more screenshots"

**How to respond:**

1. Make requested changes
2. Upload new ZIP (increment version if code changed)
3. Reply to reviewer explaining changes
4. Resubmit

#### ❌ Rejected

Extension violates policies.

**Common reasons:**

- Misleading description
- Unnecessary permissions
- Violates Chrome Web Store policies
- Contains malicious code

**If rejected:**

- Read the rejection reason carefully
- Fix the issues
- Resubmit (can take multiple attempts)

---

## Post-Publication

### Monitor Reviews

**Check regularly:**

- User reviews on Chrome Web Store
- Star ratings
- Feedback/complaints

**Respond to reviews:**

- Thank positive reviewers
- Help users with issues
- Fix reported bugs

---

### Update Extension

**When to update:**

1. **Bug fixes:** Critical issues
2. **New features:** Additional LLMs, settings, etc.
3. **Security:** Patch vulnerabilities
4. **Compatibility:** When Chrome updates break features

**How to update:**

1. Make changes locally
2. Increment version in `manifest.json` (e.g., `1.0.0` → `1.0.1`)
3. Create new ZIP
4. Upload to Chrome Web Store Developer Dashboard
5. Submit for review

**Note:** Updates go through review again (usually faster than initial review).

---

### Track Analytics

**Chrome Web Store provides:**

- Install count
- Uninstall count
- User ratings
- Crash reports

**Access:**
Developer Dashboard → Your extension → Stats

**Use this data to:**

- Understand user adoption
- Identify issues (high uninstall rate = problem)
- Plan improvements

---

## Microsoft Edge Add-ons

**Good news:** Edge uses Chromium, so your extension works with minimal changes!

### Differences from Chrome

**None for Vantage LLM!**
Our extension is 100% compatible with Edge.

### Submission Process

1. **Go to:** [Microsoft Partner Center](https://partner.microsoft.com/dashboard/microsoftedge/)
2. **Create account** (free, no fee)
3. **Upload same ZIP** as Chrome Web Store
4. **Fill out listing** (similar to Chrome)
5. **Submit for review**

**Review time:** 1-7 days (usually faster than Chrome)

**Benefits:**

- Reach Edge users (smaller audience, but still valuable)
- No submission fee

---

## Other Platforms

### Opera Add-ons

**Compatible:** Yes (Opera uses Chromium)

**Submission:** [Opera Add-ons](https://addons.opera.com/developer/)

**Worth it?** Only if you want maximum reach.

---

### Brave Browser

**Compatible:** Yes (Brave uses Chromium)

**Submission:** Brave doesn't have its own store; users install from Chrome Web Store.

**No action needed:** Automatically works if published on Chrome Web Store.

---

### Firefox Add-ons

**Compatible:** ❌ No

**Why:** Firefox doesn't support Manifest V3 or Side Panel API yet.

**Would require:** Complete rewrite using Firefox APIs.

**Our recommendation:** Not worth the effort (small user base for this feature).

---

## Marketing & Promotion

### Where to Share

1. **Reddit:**
   - r/chrome
   - r/productivity
   - r/ChatGPT
   - r/InternetIsBeautiful

2. **Twitter/X:**
   Tweet about the release, tag #ChromeExtension #AI #Productivity

3. **Product Hunt:**
   Launch on Product Hunt for visibility

4. **Hacker News:**
   Show HN post (if it's well-received, huge traffic)

5. **LinkedIn:**
   Share as a project you built

6. **Your website:**
   Add to Shelfscape portfolio

---

### Create a Landing Page

**Include:**

- Hero section (screenshot + CTA)
- Features list
- Installation link
- Demo video (optional but powerful)
- FAQ
- Support/contact info

**Example structure:**

```html
<section id="hero">
  <h1>Vantage LLM - Your AI Sidebar</h1>
  <p>Access ChatGPT, Gemini, Claude & more in one beautiful sidebar</p>
  <button>Install Now (Free)</button>
  <img src="screenshot.png" alt="Vantage LLM Screenshot" />
</section>

<section id="features">
  <h2>Features</h2>
  <div class="feature">
    <h3>🎨 Beautiful Design</h3>
    <p>Glassmorphic UI that feels premium</p>
  </div>
  <!-- More features -->
</section>
```

---

### Demo Video

**5-10 second video showing:**

1. Opening the sidebar (Ctrl+Space)
2. Switching between LLMs (dropdown)
3. Chatting with an LLM
4. Highlighting key features

**Tools:**

- OBS Studio (free screen recording)
- DaVinci Resolve (free video editing)
- Loom (quick screen recording + editing)

**Host on:**

- YouTube
- Embed on landing page

---

## Monetization (Optional)

### Free with Donations

**Keep it free, accept donations:**

- Add "Buy me a coffee" link
- Ko-fi page
- GitHub Sponsors

**Example in footer:**

```html
<span class="credit">
  Built with ❤️ by <a href="https://buymeacoffee.com/yourname">Shelfscape</a>
</span>
```

---

### Freemium Model

**Idea:** Free version + Pro version

**Pro features:**

- Custom LLM URLs
- Themes (light/dark)
- More keyboard shortcuts
- Priority support

**Implementation:**

- Require sign-in (Firebase Auth, Supabase, etc.)
- Check subscription status via API
- Unlock features if subscribed

**Pricing:**

- $2-5/month or $20-50/year

---

### Chrome Web Store Paid Extensions

**You can sell extensions directly:**

- Set a price ($0.99 - $100+)
- Chrome handles payment
- You get 95% (Chrome takes 5%)

**Downsides:**

- Harder to get installs (people hesitate to pay upfront)
- Review process is stricter

**Our recommendation:**
Keep it free for now, add premium features later if demand is high.

---

## Legal Considerations

### Terms of Service Compliance

**You're embedding third-party sites. Make sure you:**

- Don't violate ChatGPT/Gemini ToS
- Don't scrape or automate interactions
- Don't bypass paywalls (you're not—users still need accounts)

**Our assessment:**
Vantage LLM is a convenience tool (like a different browser). It doesn't violate ToS because:

- Users access their own accounts
- No data is intercepted or modified
- It's just a different UI (like using Chrome vs Edge)

**But:** OpenAI or Google could still send a cease-and-desist. If that happens, comply or negotiate.

---

### Trademark Issues

**Using "ChatGPT", "Gemini", etc. in your listing:**

**Generally okay:**

- Descriptive use (explaining what your extension does)
- Not claiming affiliation

**Not okay:**

- Using their logos (without permission)
- Claiming it's an "official" ChatGPT extension
- Misleading users into thinking OpenAI made it

**Best practice:**
Add disclaimer:

```
Vantage LLM is an independent extension and is not affiliated with
OpenAI, Google, Anthropic, or any other AI company.
```

---

## Maintenance Schedule

### Weekly

- Check for new reviews
- Respond to user feedback
- Monitor crash reports

### Monthly

- Check if LLM sites have changed CSP policies
- Test extension with latest Chrome version
- Review analytics (installs, uninstalls, ratings)

### Quarterly

- Plan new features based on user requests
- Update documentation
- Optimize performance

### Yearly

- Major version update
- Redesign (if needed)
- Marketing push

---

## Metrics to Track

### Success Indicators

**Installs:**

- Target: 1,000 in first month, 10,000 in first year

**Rating:**

- Target: 4.5+ stars

**Reviews:**

- Monitor sentiment (positive vs negative)

**Uninstalls:**

- Target: <10% uninstall rate

**Active users:**

- Daily active users (DAU)
- Weekly active users (WAU)

---

## Version History Best Practices

**Keep a CHANGELOG.md:**

```markdown
# Changelog

## [1.0.1] - 2026-02-10

### Fixed

- Fixed Perplexity not loading (added www.perplexity.ai to rules)
- Optimized icon file sizes (reduced from 2MB to 30KB)

### Changed

- Updated privacy policy link

## [1.0.0] - 2026-02-06

### Added

- Initial release
- Support for ChatGPT, Gemini, Claude, Perplexity, DeepSeek
- Glassmorphic sidebar UI
- Keyboard shortcut (Ctrl+Space)
- LLM preference persistence
```

---

## Support Channels

### GitHub Issues

**For:**

- Bug reports
- Feature requests
- Technical questions

**Best if:**
You're comfortable managing GitHub issues.

---

### Email Support

**For:**

- User questions
- Feedback
- Business inquiries

**Set up:**

- Create dedicated email (e.g., support@shelfscape.app)
- Auto-reply with expected response time

---

### FAQ Page

**Reduce support burden:**
Create FAQ on landing page or GitHub wiki.

**Common questions:**

- How do I use the keyboard shortcut?
- Which LLMs are supported?
- Is my data collected?
- How do I switch LLMs?
- Troubleshooting (link to [Troubleshooting Guide](08-Troubleshooting.md))

---

## Conclusion

**You're ready to publish!**

**Final checklist:**

- ✅ Manifest version updated
- ✅ Icons optimized
- ✅ Privacy policy written and hosted
- ✅ README updated
- ✅ ZIP package created
- ✅ Screenshots prepared
- ✅ Developer account created
- ✅ Store listing drafted

**Good luck!** 🚀

---

## Further Reading

- [Chrome Web Store Developer Policies](https://developer.chrome.com/docs/webstore/program-policies/)
- [Chrome Web Store Publishing Guide](https://developer.chrome.com/docs/webstore/publish/)
- [Best Practices for Extensions](https://developer.chrome.com/docs/extensions/mv3/user_privacy/)

---

**[← Back to Overview](00-Overview.md)**

---

_Last Updated: February 6, 2026_
