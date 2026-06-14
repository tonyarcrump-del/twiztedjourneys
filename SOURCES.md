# TJ_Website_Local — Source Attribution

This document tracks what came from the live Webador site vs. what was newly built or improved.

---

## FROM THE LIVE WEBADOR SITE (verbatim or close paraphrase)

These sections use exact wording, structure, or content pulled directly from twiztedjourneys.org:

### index.html (Home)
- **IRS recognition banner** — exact wording: "We are officially recognized by the IRS as a 501(c)(3) tax-exempt organization..."
- **Welcome section** — opening language and "Give tomorrow a chance" tagline
- **"Why We Do This"** — Tonya's founding story, verbatim from the live homepage
- **"Who We Serve"** — county list (Shelby, Johnson, Bartholomew, Rush, Decatur, Henry, Hancock) and Finding Forward Tuesday group details
- **Nav brand styling** — "Tw;zted Journeys" semicolon treatment

### events.html
- **Page title** — "Where we've been and what's next" (from live site)
- **Light Up the Night 2025** description and dates
- **2022 event** — "Journey to be Stigma Free" name
- **2021 founding events** references
- **Sept 12 & 13, 2026 event info** — from the flyer Tonya provided (event names, times, location, pricing)

### stories.html
- **Hero quote** — "Its ok if today the only thing you accomplished was to breathe" — Tonya Crump (verbatim from live site)
- **KR Story** — Katrina Lee Rodarmel's full story, verbatim from the live Twizted Journeys page
- **MS Story** — Myra Stephens' story about Deke Sierp, verbatim from the live site
- **Intro copy** — "storytelling is healing" and community framing (from live site meta/body)
- **EF Story** — placeholder (content was on live site but not captured in page text fetch)
- **JC Story** — placeholder (same as above)

### merch.html
- **12mm Semicolon Charm** — product name, description, and pricing ($5/$12/$30) from the live Webador store
- **"Pause but continue. Tomorrow needs you."** tagline for the charm
- **Webador Store links** — direct product URLs

### memorial.html
- **KR card** — Katrina Lee Rodarmel, birth date, scripture (carried from stories page content)
- **Page concept and framing** — "keeping their story going is how we carry them forward"
- **Remaining names** — placeholder (live page not fetched; link provided to copy from Webador)

### three-rs.html
- **Page title** — "A New US!!!" (verbatim from live site)
- **Three pillars** — Reunite, Reinvest, Reinvent (from live site)
- **Rule 62** — "Don't take life too seriously" — exact content and framing from the live site
- **Content warning / tone note** — "Deep meaning · Hard Honesty · Lite Laughter · Dark Sarcasm" (verbatim from live site)
- **Submit Your Own form** — structure matching live Webador form

### suicide-awareness.html
- **S.A.F.E.** — Suicide Awareness For Everyone — name, description, AFSP and Indiana Suicide Prevention Coalition partnership text (from live site)
- **Crisis 988 block** — placement and styling mirrors live site priority

---

## NEW — BUILT FOR THIS LOCAL VERSION (not on the live Webador site)

These sections are improvements, additions, or structural upgrades that don't exist on the current Webador site:

### All pages
- **Crisis bar at top** — pinned 988 + Crisis Text Line bar on every single page (improved from Webador's less consistent crisis placement)
- **988 crisis section** at bottom of every page (consistent placement — not on all Webador pages)
- **Footer "not-a-hotline" disclaimer** — added explicitly on every page
- **Sticky nav** — all 9 pages linked in nav on every page; `class="active"` on current page
- **Placeholder blocks (amber dashed)** — clearly marked for content that needs to be copied from Webador or filled in

### index.html
- **"What You Find Here"** card grid — structured visual overview (new, based on existing TJ content themes)
- **2026 event preview cards** — structured preview with dates, location, buttons (new layout)
- **Donate placeholder button** — noted clearly as needing a real link

### events.html
- **RSVP / Vendor Signup / Facebook placeholder buttons** on 2026 events (new — Webador doesn't have these structured)
- **Photo grid placeholder** for 2025 Light Up the Night (new — notes the 40+ photos to add)
- **Structured event card layout** for all years (cleaner than Webador's flat layout)

### merch.html
- **"Handmade by Tonya" section** — entire QR story system explanation, how-it-works steps, item ID system (new — this is the story system integration, not on Webador)
- **QR tag story form link** — linking to ../TJ_Story_System/story.html

### stories.html
- **Story QR system promo card** — linking handmade item buyers to the story form (new)
- **Submission privacy notice** — "Your safety matters. You choose what you share." (new safety language)

### suicide-awareness.html
- **Warning Signs section** — "Things They Say," "Things You Notice," "What To Do" card grid (new — standard awareness content not on Webador but appropriate and important)
- **"Asking someone about suicide does NOT put the idea in their head"** callout card (new)
- **Resources & Partners grid** — structured resource cards for all TJ partners (expanded from Webador's simpler list)
- **Finding Forward callout** on this page (new connection between suicide awareness and the peer group)

### mental-health.html
- **Entire page is new** — the live Webador site has a Mental Health page but its content was not available in the page text fetch. The page built here uses TJ brand voice and appropriate content. A placeholder is included to add the exact Webador text.
- Sections: What Is Mental Health, Common Conditions (6 cards), Breaking the Stigma (stigma vs. support language), Finding Forward, Small Steps Matter, Resources grid

### everyone-fidgets.html
- **Page rebuilt from scratch** — the live Webador Everyone Fidgets page content was not available in the fetch. The page built here is based on TJ's known mission and Tonya's handmade items. A placeholder is included to add the exact Webador text.
- Sections: Why It Helps (3 cards), Handmade Items + QR system, Events connection
- Full placeholder block directing to copy content from the live site

---

## PAGES WITH INCOMPLETE CONTENT (require copy from live site)

| Page | What's Missing | Where to Get It |
|------|---------------|-----------------|
| suicide-awareness.html | S.A.F.E. section body text | twiztedjourneys.org/suicide-awareness |
| stories.html | EF story full text | twiztedjourneys.org/twizted-journeys |
| stories.html | JC story full text | twiztedjourneys.org/twizted-journeys |
| memorial.html | Full memorial name list | twiztedjourneys.org/memorial-page |
| mental-health.html | Full page body text | twiztedjourneys.org/mental-health |
| everyone-fidgets.html | Full page body text | twiztedjourneys.org/everyone-fidgets |
| merch.html | Shirt & awareness item products | twiztedjourneys.org/merch.html |

---

## FILES IN THIS FOLDER

| File | Description |
|------|-------------|
| style.css | Shared stylesheet — TJ brand variables, all components |
| index.html | Home page |
| events.html | Events — past and upcoming |
| stories.html | Community journey stories |
| merch.html | Merch store + handmade QR system |
| memorial.html | Memorial wall + add-a-name form |
| three-rs.html | 3 R's — Reunite, Reinvest, Reinvent |
| suicide-awareness.html | Suicide awareness resources and warning signs |
| mental-health.html | Mental health education and resources |
| everyone-fidgets.html | Everyone Fidgets initiative |
| _nav.html | Nav HTML snippet (reference only — not a real page) |
| SOURCES.md | This file |

---

## ARTWORK ADDED TO LOCAL WEBSITE

Images were sourced from `C:\Twisted Journeys\images\` and copied into `TJ_Website_Local\images\` with clean filenames.

| Clean Filename | Original File | Page(s) Used On | Type | Tonya Approval |
|---|---|---|---|---|
| `logo-neon.png` | `images/logo.png` | index.html (welcome), merch.html (hero) | TJ official neon logo — purple/teal winding road | ✅ Tonya's logo |
| `what-comes-after-the-pause-logo.png` | `images/(No subject)/image000003.png` | index.html (founding story), suicide-awareness.html (hero) | "What Comes After the Pause" event logo with TJ swirl | ✅ Tonya's artwork |
| `what-comes-after-the-pause-promo.png` | `images/(No subject)/image000000(1).png` | events.html (hero), merch.html (handmade section) | Full event promo artwork with mission text | ✅ Tonya's artwork |
| `vendor-event-flyer.png` | `images/image000001(4) (1).png` | events.html (alongside promo) | Official Sept 12 & 13 "VENDOR NEEDED!" event flyer | ✅ Tonya's flyer |
| `tj-road.png` | `images/(No subject)/image000006.png` | index.html (welcome), mental-health.html (hero), everyone-fidgets.html (hero) | Purple/teal camo winding road — signature TJ motif | ✅ Tonya's artwork |
| `feather-quill.png` | `images/(No subject)/image000001(2).png` | stories.html (hero) | Purple/teal watercolor feather quill — storytelling symbol | ✅ Tonya's artwork |
| `tj-cursive-logo.png` | `images/(No subject)/image000008.png` | memorial.html (hero) | Elegant cursive "Twizted Journeys" with semicolon — soft, respectful | ✅ Tonya's artwork |
| `tj-brush-logo.png` | `images/(No subject)/image000004.png` | three-rs.html (hero) | Brush lettering TJ logo — teal/purple gradient | ✅ Tonya's artwork |
| `tj-handlettered-logo.jpg` | `images/(No subject)/image000001.jpg` | Not placed (reference copy) | Hand-lettered "TJ" calligraphy — authentic original | ✅ Tonya's handwork — available for use |
| `what-comes-after-the-pause-promo-2.png` | `images/(No subject)/image000000(1) - Copy.png` | Not placed (duplicate of promo) | Same as promo artwork — kept as backup | ✅ Backup copy |

### Images NOT placed (need from Tonya)

| What's Needed | Where It Goes | Save As |
|---|---|---|
| 12mm Semicolon charm product photo | merch.html — charm card | `images/charm-semicolon.jpg` |
| Awareness shirt product photo | merch.html — shirt card | `images/shirt-awareness.jpg` |
| Awareness items product photo | merch.html — items card | `images/awareness-items.jpg` |
| Rule 62 graphic from Webador | three-rs.html — Rule 62 section | `images/rule62.jpg` |
| 2025 Light Up the Night event flyer | events.html — 2025 section | `images/2025-flyer.jpg` |
| 2025 event photos (40+) | events.html — photo grid | `images/2025/img-001.jpg` etc. |
| Handmade fidget items photos | everyone-fidgets.html | `images/fidget-items.jpg` |
| Founding story personal photo (2021) | index.html — founding story | `images/founding-photo.jpg` |

### CSS Classes Added (style.css)

New reusable image classes added to support artwork:
- `.artwork-frame` — generic responsive image frame
- `.hero-artwork` — main two-column hero images with glow shadow
- `.event-flyer-img` — event flyer display with purple shadow
- `.story-artwork` — storytelling images (feather quill etc.)
- `.memorial-artwork` — soft, low-opacity remembrance images
- `.merch-photo` — product/handmade item photos
- `.road-accent` — TJ winding road motif images
- `.logo-badge` — small inline logo usage
- `.image-caption` — italic muted caption below images
- `.artwork-on-white` — white-background image wrapper with padding

## IMAGE FOLDER — CURRENT STATE

```
TJ_Website_Local/
  images/
    logo-neon.png                          ✅ PLACED (index, merch)
    what-comes-after-the-pause-logo.png    ✅ PLACED (index founding story, suicide-awareness)
    what-comes-after-the-pause-promo.png   ✅ PLACED (events hero, merch handmade)
    what-comes-after-the-pause-promo-2.png ⬜ backup copy, not placed
    vendor-event-flyer.png                 ✅ PLACED (events)
    tj-road.png                            ✅ PLACED (index, mental-health, everyone-fidgets)
    feather-quill.png                      ✅ PLACED (stories)
    tj-cursive-logo.png                    ✅ PLACED (memorial)
    tj-brush-logo.png                      ✅ PLACED (three-rs)
    tj-handlettered-logo.jpg               ⬜ available, not yet placed
    charm-semicolon.jpg                    ❌ MISSING — need from Tonya
    shirt-awareness.jpg                    ❌ MISSING — need from Tonya
    awareness-items.jpg                    ❌ MISSING — need from Tonya
    rule62.jpg                             ❌ MISSING — need from Webador
    2025-flyer.jpg                         ❌ MISSING — need from Tonya
    2025/ (folder)                         ❌ MISSING — need 40+ event photos
    fidget-items.jpg                       ❌ MISSING — need from Tonya
    founding-photo.jpg                     ❌ MISSING — need from Tonya
```

All image references in the HTML files use relative paths from the `images/` folder.

---

*Built May 2026. Local mirror of twiztedjourneys.org for development and backup.*
*Content questions: info@twiztedjourneys.org*
