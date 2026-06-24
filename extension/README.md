# CareerFlow Chrome Extension

Save LinkedIn jobs to Goal Session with one click. **Free — no Chrome Web Store / $5 needed.**

## Install (Load unpacked)

### Step 1 — Open extensions page

Chrome address bar e **copy-paste** koro (type koro na manually):

```
chrome://extensions
```

Enter press koro.

### Step 2 — Developer mode

Dan-paser **Developer mode** toggle **ON** koro.

ON hole **Load unpacked** button dekhabe (dan-paser upore).

### Step 3 — Select folder (important!)

**Load unpacked** click → ei **exact folder** select koro (andar e `manifest.json` thakte hobe):

```
/Users/emtiazahmed/Desktop/GITHUB/careerflow/extension
```

⚠️ **Wrong:** `careerflow` parent folder select korle kaaj korbe na.  
⚠️ **Right:** `extension` folder — er vitore `manifest.json`, `background.js` dekhte hobe.

### Step 4 — Verify

List e **CareerFlow - Save LinkedIn Jobs** version **1.0.1** ashle latest.  
**Reload (🔄)** click koro code update er por.

## Use (LinkedIn)

**Way 1 — Auto (may be partial on LinkedIn):**
1. Job page → **⚡ Save to CareerFlow**

**Way 2 — Best (always works):**
1. Click **About the job** section
2. **Cmd+A** → **Cmd+C**
3. Click **📋 Paste copied & Save**
4. CareerFlow Goal Session khulbe → **Preview Session**

## Troubleshoot

| Problem | Fix |
|---------|-----|
| **Load unpacked button nei** | Developer mode ON koro |
| **Could not load manifest** | `extension` folder select koro, parent na |
| **Manifest file missing** | Folder e `manifest.json` ache confirm koro |
| **Green button LinkedIn e nei** | Job **details** page kholo (`/jobs/view/`), feed na. Page refresh. |
| **Arc / Brave** | Same: `arc://extensions` or `brave://extensions` |

## Files in this folder

```
extension/
  manifest.json      ← must be here
  background.js
  content-linkedin.js
  content-careerflow.js
  popup.html
  icons/
```

## Notes

- Chrome Web Store $5 fee **only for public publish** — not for Load unpacked
- Extension does not store your password
