# Privacy Policy for ADHDRelief

**Last Updated: January 1, 2026**

## Our Commitment to Privacy

ADHDRelief is built with privacy as a core principle. We believe your focus sessions, listening habits, and personal data should remain private. This privacy policy explains exactly what data we collect, how it's used, and what we DON'T do.

**TL;DR: We collect nothing. Everything stays on your device.**

---

## What Data We Collect

### Data Stored Locally on Your Device

ADHDRelief stores the following data **exclusively on your device** using browser storage APIs:

#### 1. Extension Settings (Chrome Storage API)
- **Current playback state** (playing/stopped)
- **Selected mode** (Continuous or Break Mode)
- **Selected sound type** (brown noise, rain, lofi loop, etc.)
- **Volume level** (0-100)
- **Timer settings** (preset selection, custom durations, current phase)

**Purpose:** To remember your preferences across browser sessions.
**Storage Location:** `chrome.storage.local` (never leaves your browser)
**Retention:** Until you uninstall the extension or clear browser data

#### 2. Custom Audio Files (IndexedDB)
- **Audio file data** (your uploaded "My Vibe" sounds)
- **Custom sound names** (names you assign to your sounds)
- **Sound order** (your preferred arrangement of sounds)

**Purpose:** To enable the "My Vibe" custom sound feature.
**Storage Location:** Browser IndexedDB (never leaves your browser)
**Retention:** Until you delete the sounds or uninstall the extension

---

## What Data We DON'T Collect

We are committed to **zero data collection**. Specifically, we DO NOT:

- ❌ **No Analytics or Tracking** - We don't use Google Analytics, Mixpanel, or any tracking service
- ❌ **No Usage Statistics** - We don't know which sounds you prefer, how long you use the extension, or when you use it
- ❌ **No Personal Information** - No names, emails, phone numbers, or any identifying information
- ❌ **No Account Creation** - No sign-ups, no logins, no user profiles
- ❌ **No Cookies** - We don't set any cookies or tracking mechanisms
- ❌ **No Network Requests** - We don't send any data to external servers (after installation)
- ❌ **No Third-Party Services** - No external APIs, SDKs, or integrations
- ❌ **No Crash Reports** - We don't collect error logs or crash data
- ❌ **No A/B Testing** - We don't experiment with your experience or collect test data
- ❌ **No Fingerprinting** - We don't attempt to identify or track you across sessions

---

## How Your Data is Used

All data stored by ADHDRelief is used **exclusively** for:

1. **Remembering your preferences** - Volume, sound type, timer settings
2. **Providing functionality** - Playing your selected sounds, managing timers
3. **Storing custom sounds** - Keeping your uploaded audio files available

**We do not:**
- Share your data with anyone
- Sell your data
- Use your data for advertising
- Access your data remotely
- Analyze your usage patterns

---

## Data Storage and Security

### Local Storage Only

All data is stored locally on your device using:
- **Chrome Storage API** - For settings and preferences
- **IndexedDB** - For custom audio files

This data:
- ✅ Never leaves your browser
- ✅ Is not accessible to us (the developers)
- ✅ Is not transmitted over the internet
- ✅ Is protected by your browser's security mechanisms

### No Cloud Sync

ADHDRelief does **not** use Chrome Sync or any cloud storage. Your settings and custom sounds remain on the device where you installed the extension.

If you use multiple devices, you'll need to set up the extension separately on each one.

---

## Permissions Explained

ADHDRelief requests minimal permissions:

### Required Permissions

1. **Storage Permission** (`storage`)
   - **Why:** To save your settings and custom sounds locally
   - **What we access:** Only data we created (settings, custom audio)
   - **What we DON'T access:** Other extensions' data, browser history, bookmarks

2. **Offscreen Permission** (`offscreen`)
   - **Why:** To generate audio using Web Audio API (service workers can't play audio directly)
   - **What we access:** Only our own offscreen document for audio playback
   - **What we DON'T access:** Your browsing activity, other tabs, or websites

3. **Alarms Permission** (`alarms`)
   - **Why:** To run the Pomodoro timer accurately
   - **What we access:** Timer scheduling API only
   - **What we DON'T access:** Any other alarms or system functions

### Permissions We DON'T Request

- ❌ No browsing history access
- ❌ No access to your tabs or websites you visit
- ❌ No access to your downloads
- ❌ No access to your bookmarks
- ❌ No network/internet access
- ❌ No webcam or microphone access
- ❌ No location access
- ❌ No clipboard access

---

## Third-Party Services

**ADHDRelief uses ZERO third-party services.**

- No analytics platforms
- No advertising networks
- No external APIs
- No CDNs (all assets are bundled)
- No social media integrations
- No payment processors (the extension is free)

---

## Data Deletion

### Deleting Your Data

You have full control over your data:

**Delete Custom Sounds:**
1. Click the × button on any custom sound in the extension popup
2. The sound is immediately deleted from IndexedDB

**Delete All Extension Data:**
1. Go to `chrome://extensions/`
2. Find ADHDRelief
3. Click "Remove" to uninstall
4. All settings and custom sounds are permanently deleted

**Clear Settings Only (Keep Extension):**
1. Right-click the extension icon
2. Click "Inspect popup"
3. Go to Application tab → Storage → Clear site data

### Data Retention

- **Settings:** Retained until you uninstall or manually clear
- **Custom sounds:** Retained until you delete them or uninstall
- **No server-side data:** There is no data to retain on our end

---

## Children's Privacy

ADHDRelief does not collect any personal information from anyone, including children under 13. The extension does not require age verification and does not knowingly collect data from children.

Parents and guardians can use ADHDRelief with confidence knowing that no data is collected or transmitted.

---

## Changes to This Privacy Policy

We may update this Privacy Policy from time to time. When we do:

1. We'll update the "Last Updated" date at the top
2. We'll describe the changes in the extension's release notes
3. We'll commit changes to our GitHub repository

**We will never:**
- Start collecting data without explicit notification
- Change our privacy-first principles
- Add tracking or analytics

You can review the full history of this policy on our [GitHub repository](https://github.com/yourusername/ADHDRelief).

---

## Open Source Transparency

ADHDRelief is open source. You can:

- ✅ Review the complete source code
- ✅ Verify we don't collect data
- ✅ Audit our use of permissions
- ✅ Inspect our network requests (there are none)
- ✅ Build the extension yourself from source

**GitHub Repository:** [Link to your repository]

---

## Your Rights

Under this privacy policy, you have the right to:

1. **Know what data is stored** - All data is documented in this policy
2. **Access your data** - Open your browser's storage inspector
3. **Delete your data** - Uninstall the extension anytime
4. **Use the extension anonymously** - No account or identification required
5. **Inspect the code** - Review our open source repository

---

## Legal Compliance

### GDPR Compliance (EU)

ADHDRelief complies with the General Data Protection Regulation (GDPR) because:
- We collect no personal data
- We don't process any user information
- We don't transfer data outside your device
- You have full control over deletion

### CCPA Compliance (California)

ADHDRelief complies with the California Consumer Privacy Act (CCPA) because:
- We don't sell personal information (we don't collect any)
- We don't share data with third parties
- You have full control over your data

### Other Jurisdictions

Since we collect no data, we comply with privacy regulations worldwide including:
- PIPEDA (Canada)
- LGPD (Brazil)
- APPI (Japan)
- And others

---

## Contact Us

If you have questions about this Privacy Policy or ADHDRelief's privacy practices:

- **GitHub Issues:** [Link to your GitHub issues page]
- **Email:** [Your email if you want to provide one]

**Please note:** We cannot access your data or help recover it. All data is stored locally on your device.

---

## Transparency Pledge

We pledge to:

1. ✅ **Never collect personal data** without explicit consent and notification
2. ✅ **Never add tracking or analytics** to this extension
3. ✅ **Keep the codebase open source** for public audit
4. ✅ **Update this policy** whenever we make changes to data practices
5. ✅ **Maintain our privacy-first philosophy** as a core principle

---

## Summary

**What ADHDRelief stores:** Your settings and custom sounds, locally on your device.

**What ADHDRelief collects:** Nothing. Zero. Nada.

**What ADHDRelief shares:** Nothing. We don't have access to your data.

**Your control:** Complete. Delete anytime by uninstalling.

---

**Your focus sessions are private. Your data is yours. Always.**

*ADHDRelief - Privacy by design, privacy by default.*
