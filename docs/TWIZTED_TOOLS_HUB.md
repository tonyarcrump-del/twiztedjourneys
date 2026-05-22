# Twizted Tools Hub — Internal Documentation

**Created:** 2026-05-20  
**Status:** Internal only — not public-facing  
**Do not push to GitHub without Nate's review**

---

## Where the Hub Lives

**File:**
```
C:\Projects\twiztedjourneys-official\twizted-tools-hub.html
```

**Backup copy (Claude outputs):**
```
C:\Users\NoCap\AppData\Roaming\Claude\local-agent-mode-sessions\...\outputs\twizted-tools-hub.html
```

---

## How Tonya Opens It

1. Open **File Explorer**
2. Navigate to `C:\Projects\twiztedjourneys-official\`
3. Double-click `twizted-tools-hub.html`
4. It opens in the default web browser
5. That's it — no server needed, no login, no install

> **Internet required for QR generation.** The QR Code Builder uses a CDN library (qrcode.js from cdnjs.cloudflare.com). If offline, use https://goqr.me/ as a fallback.

---

## What the Hub Does

The Twizted Tools Hub is a single HTML file that gives Tonya one place to:

- Generate QR codes for any URL
- Access all flyer cards with status + instructions
- Use the **Ask the Hub** command box to type plain-English requests
- Get starter drafts for Facebook posts, donor updates, and podcast announcements
- Open live pages (website, donate, Facebook group) in one click

---

## Ask the Hub — How It Works

The hub includes an **"Ask the Hub"** text box where Tonya can type a plain-English request and get a useful response.

### What it understands (keyword routing, no API):

| Request type | Example phrase | What happens |
|---|---|---|
| QR code | "Generate a QR code for the events page" | Pre-loads URL in QR Builder, scrolls there |
| September event flyer | "Make a September event flyer" | Routes to September Event Flyer card |
| September vendor flyer | "Create a vendor flyer for September" | Routes to September Vendor Flyer card |
| November event flyer | "November event flyer" | Routes to November card, shows what's needed |
| November vendor flyer | "November vendor flyer" | Routes to November vendor card |
| Shoe Drive | "Make a Shoe Drive flyer" | Routes to Shoe Drive card |
| Facebook / social post | "Make a Facebook post for the Shoe Drive" | Generates a starter post draft (copy/paste) |
| Donor update | "Write a donor update for tonight" | Generates a donor update email draft |
| Podcast announcement | "Create a podcast guest announcement" | Generates a starter announcement draft |
| Charm / tracker | "Create a QR card for the semicolon charm" | Routes to Treasure Tracker card |
| Status check | "What tools are ready to use?" | Lists all tool statuses |

### Example prompts (pre-loaded in the hub):
- Make a September event flyer with a QR code
- Create a vendor flyer for the November event
- Make a Facebook post for the Shoe Drive
- Create a QR card for the semicolon charm
- Write a donor update for tonight
- Generate a QR code for the events page
- Make a Shoe Drive flyer
- Create a podcast guest announcement
- What tools are ready to use?

### Future AI command layer:
Tonya will eventually be able to type or speak anything — "Make this flyer sound more professional" or "Rewrite this post for a younger audience" — and the Hub will route the request to a real AI generator that produces a finished output. This requires connecting the Hub to an AI API (Claude or similar). That is the **next build step** after Wednesday. Ask Nate to wire it up when ready.

---

## Tools — Working Now

| Tool | Status | How to use |
|---|---|---|
| **QR Code Builder** | ✅ Working | Type URL → Generate → Download PNG |
| **Website Preview** | ✅ Live | Click to open twiztedjourneys.org |
| **Donate Page** | ✅ Live | Click to open donations-matter page |
| **Facebook Group** | ✅ Live | Click to open Facebook group |
| **Ask the Hub** | ✅ Working | Type request → get output or routing |
| **September Event Flyer card** | ✅ Ready to build (needs date + RSVP URL from Tonya) | Open card, add URL, generate QR |
| **September Vendor Flyer card** | ✅ Ready to build (needs vendor signup URL) | Open card, add URL, generate QR |

---

## Tools — Placeholders (not built yet)

| Tool | Status | What's needed |
|---|---|---|
| **November Event Flyer** | ⏳ Needs details | Event date, venue, RSVP link |
| **November Vendor Flyer** | ⏳ Needs details | November event confirmed first |
| **Shoe Drive Flyer** | ⏳ Waiting on kit | Campaign dates, drop-off locations, accepted shoe types |
| **Promo Builder** | 🔧 External (Canva) | No standalone app exists — use Canva, download, add QR here |
| **Twizted Treasure Tracker** | 🔧 Preview only | TJ_Story_System not deployed locally — ask Nate |
| **Podcast Platform** | 🔧 Placeholder | Confirm podcast launch details first |

---

## How QR Codes Connect to Flyers

**The workflow is:**
1. Decide the URL the QR should point to (events page, vendor signup, donate page, etc.)
2. Open the Hub
3. Either use the main **QR Code Builder** or the mini QR generator inside each flyer card
4. Type the URL → Generate → Download the PNG
5. Import that PNG into the flyer design (Canva, etc.)
6. **Scan the QR with your phone before printing**
7. Print

**QR Standards:**
- Black and white only — no colored QR codes
- Minimum print size: 1 inch × 1 inch (larger is better)
- High-contrast background only
- Always test scan before finalizing

**Known QR targets:**
| Page | URL |
|---|---|
| Main site | https://www.twiztedjourneys.org/ |
| Events | https://www.twiztedjourneys.org/events.html |
| Donate | https://www.twiztedjourneys.org/donations-matter |
| Facebook Group | https://www.facebook.com/groups/560290368564902/ |
| Shoe Drive | https://www.twiztedjourneys.org/shoe-drive.html |
| Merch / Charm | https://www.twiztedjourneys.org/merch.html |
| Vendor signup | TODO — not confirmed yet |
| Sept event RSVP | TODO — not confirmed yet |
| Nov event RSVP | TODO — not confirmed yet |

---

## What Still Needs Confirmed from Tonya

Confirmed vs. still needed:

**September Event Flyer — CONFIRMED (from events.html source files)**
- [x] Event: Light Up the Night (awareness ride)
- [x] Date: September 12, 2026
- [x] Venue: Shelby County Fairgrounds, 40 & 8 Building, 500 Frank Street, Shelbyville IN
- [x] Registration: 11AM
- [x] Vendors: $50/day
- [x] RSVP: mailto:info@twiztedjourneys.org (subject: RSVP - Ride Registration)
- [x] QR target: https://www.twiztedjourneys.org/events.html
- [ ] TODO: Formal RSVP/registration URL (email works for now)

**September Vendor Flyer — CONFIRMED**
- [x] Event dates: Sept 12-13, 2026
- [x] Venue: Shelby County Fairgrounds, 40 & 8 Building, 500 Frank Street, Shelbyville IN
- [x] Vendor fee: $50/day
- [x] Contact: mailto:info@twiztedjourneys.org (subject: Vendor Signup - September 2026)
- [x] QR target: https://www.twiztedjourneys.org/events.html
- [x] Asset: images/vendor-event-flyer.png
- [ ] TODO: Formal vendor signup URL (email used for now)

**November Event Flyer — NOTHING IN SOURCE FILES**
- [ ] No event details found in any project folder
- [ ] Event date and time — needed
- [ ] Venue / location — needed
- [ ] Event name/theme — needed
- [ ] Registration link — needed
- [ ] Do not build until Tonya confirms all of the above

**November Vendor Flyer — NOTHING IN SOURCE FILES**
- [ ] Blocked by November event confirmation
- [ ] Vendor fee and table details — needed
- [ ] Contact/signup URL — needed

**Shoe Drive Campaign — PARTNER CONFIRMED, DATES TBD**
- [x] Campaign name: Shoe Us the Love
- [x] Partner: Funds2Orgs
- [x] Accepted: gently worn, used, and new shoes
- [x] Goal: 100 bags (~25 pairs per bag)
- [x] Paid per pound of shoes collected
- [x] Partner contact: Jim Cundiff, jim@funds2orgs.com, 407-930-2979
- [x] QR target: https://www.twiztedjourneys.org/shoe-drive.html
- [x] Assets: images/Bad_Shoes.png, images/Good_Shoes.png
- [ ] TODO: Confirm campaign start and end dates
- [ ] TODO: Confirm drop-off location(s) and address(es)

---

## What Should Wait Until After Wednesday

- Do not push hub file to GitHub until Nate reviews
- Do not add hub to the public site navigation
- Do not build November flyers until event details are confirmed
- Do not deploy TJ_Story_System or Twizted Treasure Tracker locally without Nate
- Do not wire up real AI API for "Ask the Hub" until after current sprint

---

## Folders Audited

| Folder | Found? | Contents |
|---|---|---|
| `C:\Projects\twiztedjourneys-official` | ✅ Yes | Main static HTML/CSS/JS site — full brand system |
| `C:\Twisted Journeys\TJ_Website_Local\qr-codes` | ✅ Real, runnable | Node.js QR Card Builder — `npm start` → localhost:4177. Creates 1600×2400 branded print cards. |
| `C:\Twisted Journeys\Twizted Promo Builder` | ✅ Has docs only | INSTRUCTIONS.md = Claude AI system prompt for promo content. No runnable app. |
| `C:\Twisted Journeys\TJ_Event_Agent` | ✅ Has docs only | SKILL.md + INTAKE_TEMPLATE.md. Agent spec — not a running process. |
| `C:\Twisted Journeys\TJ_Story_System` | ✅ Files ready | All HTML/JS files complete. Needs Supabase + Netlify to deploy. See SETUP.md. |
| `C:\Twisted Journeys\hope-signal-ai` | ✅ Next.js app | Has .env files with secrets. SENSITIVE — do not expose. Ask Nate before touching. |

**Decision:** No folder merging was done. Hub is a single static HTML file added to the main project. This is the correct approach for today — safe, reversible, no risk to existing project.

---

## Files Changed

| File | Action | Location |
|---|---|---|
| `twizted-tools-hub.html` | Created | `C:\Projects\twiztedjourneys-official\` |
| `docs/TWIZTED_TOOLS_HUB.md` | Created | `C:\Projects\twiztedjourneys-official\docs\` |

No existing files were modified. No folders were moved or merged.

---

## Technical Notes

- **Tech stack:** Single self-contained HTML file. No build step, no server, no framework.
- **QR library:** qrcode.js v1.0.0 from cdnjs.cloudflare.com (loaded on demand, requires internet)
- **Offline fallback:** Hub works without internet except for QR generation. Fallback: https://goqr.me/
- **Not in public nav:** `_nav.html` was not modified. Hub is not linked from the public site.
- **Not pushed to GitHub:** Hub exists locally only. Push requires Nate review.
- **CSS:** Hub uses the same brand variables as the main site (`--purple`, `--teal`, `--cyan`, `--midnight`, `--white`)

---

*Twizted Tools Hub — Internal — Do not distribute*
