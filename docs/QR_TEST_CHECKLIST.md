# Twizted Journeys — QR Code Test Checklist

**Created:** May 2026  
**Maintained by:** Nate / Tonya  
**QR files location:** `C:\Projects\twiztedjourneys-official\public\assets\qr\`  
**QR hub page:** `twizted-qr-codes.html`  
**Generator script:** `C:\Temp\tj-qr-gen\gen.js` (Node.js + qrcode npm)  

---

## How to Regenerate a QR Code

```bash
cd C:\Temp\tj-qr-gen
# Edit gen.js to update the URL, then:
node gen.js
# Output goes to: C:\Projects\twiztedjourneys-official\public\assets\qr\
```

Or use the branded card builder (1600×2400 print-ready):
```bash
cd "C:\Twisted Journeys\TJ_Website_Local\qr-codes"
npm start
# Open: http://localhost:4177
```

---

## QR Code Test Checklist

| # | QR Name | Destination URL | Where It Appears | File | Status | Tested | Notes |
|---|---------|-----------------|------------------|------|--------|--------|-------|
| 1 | Website | https://www.twiztedjourneys.org/ | twizted-qr-codes.html (card 1), homepage callout | `website-qr-2026.png` | ✅ Live URL | ⬜ No | Test with phone camera |
| 2 | Facebook Group | https://www.facebook.com/groups/560290368564902/ | twizted-qr-codes.html (card 2), all page footers | `facebook-group-qr-2026.png` | ✅ Live URL | ⬜ No | Confirmed group ID |
| 3 | Facebook Page | ~~https://www.facebook.com/twiztedjourneys~~ | ~~twizted-qr-codes.html (card 3)~~ | `facebook-page-qr-2026.png` | ❌ Removed | — | Card removed from QR hub — URL unconfirmed (goes nowhere). Re-add when real Facebook Page URL is confirmed. |
| 4 | Donate | https://www.twiztedjourneys.org/donations-matter | twizted-qr-codes.html (card 4), all page navs | `donate-qr-2026.png` | ✅ Live URL | ⬜ No | Test that donation page loads correctly |
| 5 | Events / Registration | https://tonyarcrump-del.github.io/twiztedjourneys/events.html | twizted-qr-codes.html (card 5) | `events-qr-2026.png` | ⚠️ GitHub preview (temporary) | ⬜ No | Update to twiztedjourneys.org/our-journeys once live site redirects |
| 6 | Shop / Merch | https://twiztedjourneys.org/merch.html | twizted-qr-codes.html (card 6), merch.html | `merch-qr-2026.png` | ✅ Live URL | ⬜ No | Test merch page loads |
| 7 | Memorial | https://www.twiztedjourneys.org/memorial-page | twizted-qr-codes.html (card 7) | `memorial-qr-2026.png` | ✅ Live URL | ⬜ No | Verify memorial page loads on live Webador site |
| 8 | Share Your Journey (Twizted Treasures) | https://tonyarcrump-del.github.io/twiztedjourneys/twizted-treasures.html | twizted-qr-codes.html (card 8), merch.html callout, stories.html callout | `journey-qr-2026.png` | ⚠️ GitHub preview (temporary) | ⬜ No | Update to live URL once twizted-treasures.html is deployed |

---

## Status Key

| Symbol | Meaning |
|--------|---------|
| ✅ | Live, confirmed URL |
| ⚠️ | Temporary or unconfirmed URL — needs update |
| ❌ | Broken or missing |
| ⬜ No | Not yet tested with a phone scan |
| ✅ Yes | Tested and confirmed scannable |

---

## Testing Steps

1. Open `twizted-qr-codes.html` in a browser (file:// or GitHub Pages preview)
2. Use your phone camera to scan each QR code
3. Confirm the destination loads correctly
4. Mark **Tested** column as `✅ Yes`
5. Note any issues in the **Notes** column

---

## Pending Actions

- [x] Facebook **Page** URL confirmed (acebook.com/twiztedjourneys) — `facebook-page-qr-2026.png` generated
- [ ] Once Events page goes live on twiztedjourneys.org → update `events-qr-2026.png` destination
- [ ] Once Twizted Treasures page is deployed → update `journey-qr-2026.png` destination
- [ ] Test all 7 QR codes with a phone (document results above)
- [ ] Print QR sheet (Ctrl+P on twizted-qr-codes.html) and test from paper
- [ ] Add QR codes to printed flyers for Sept 12-13, 2026 events

---

## Connected Pages (QR codes appear on)

| Page | Nav Link | Footer Link | QR Card Shown | Homepage Callout |
|------|----------|-------------|---------------|-----------------|
| index.html | ✅ | ✅ | — | ✅ |
| events.html | ✅ | ✅ | — | — |
| merch.html | ✅ | ✅ | — | — |
| stories.html | ✅ | ✅ | — | — |
| twizted-treasures.html | ✅ | ✅ | — | — |
| resources.html | ✅ | ✅ | — | — |
| memorial.html | ✅ | nav only | — | — |
| about.html | ✅ | nav only | — | — |
| podcast.html | ✅ | nav only | — | — |
| shoe-drive.html | ✅ | nav only | — | — |
| everyone-fidgets.html | ✅ | nav only | — | — |
| mental-health.html | ✅ | nav only | — | — |
| suicide-awareness.html | ✅ | nav only | — | — |
| three-rs.html | ✅ | nav only | — | — |
| twizted-qr-codes.html | active | ✅ | All 8 cards | — |

---

## Asset Folder Structure Created

```
C:\Projects\twiztedjourneys-official\
  public\
    assets\
      logo\       — 6 files (logo-neon.png, tj-brush-logo.png, tj-cursive-logo.png, tj-handlettered-logo.jpg, tj-site-logo-header.jpg, what-comes-after-the-pause-logo.png)
      flyers\     — 3 files (vendor-event-flyer.png, what-comes-after-the-pause-promo.png, what-comes-after-the-pause-promo-2.png)
      backgrounds\ — 4 files (hero-banner-main.png, tj-road.png, twizted-journeys-banner.jpg, twizted-journeys-banner-mobile.jpg)
      merch\      — 8 files (charm photos, shoe images, merch items)
      qr\         — 7 PNG files (generated 2026)
      social\     — 12 files (social graphics, awareness posts, Facebook photos)
```

---

*Do not push to GitHub until Nate reviews.*
