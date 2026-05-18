# Twizted Journeys — Website Project

**Twizted Journeys** is a nonprofit mental health awareness and community support organization built around the twisted semicolon identity — a symbol of continuing the story, even through the hardest moments.

> *"The journey isn't always straight. It's Twizted. And that's okay."*

---

## Live Site

🌐 **[twiztedjourneysorganization.com](https://twiztedjourneysorganization.com)**

---

## Project Structure

```
TJ_Website_Local/
├── index.html               # Homepage (hero, mission, events teaser)
├── events.html              # Community events listing
├── memorial.html            # Memorial tribute page
├── mental-health.html       # Mental health resources
├── merch.html               # Merch store
├── shoe-drive.html          # Shoe drive campaign
├── stories.html             # Community stories
├── suicide-awareness.html   # Awareness resources
├── three-rs.html            # The Three Rs page
├── everyone-fidgets.html    # Everyone Fidgets program
├── style.css                # Global stylesheet (purple/teal/black branding)
├── _nav.html                # Shared navigation include
│
├── images/                  # All project images
│   ├── logos/               # Brand logos (neon, brush, cursive, handlettered)
│   ├── events/              # Event photos and collages
│   ├── flyers/              # Printable event flyers
│   ├── merch/               # Merch product photos
│   ├── memorials/           # Memorial imagery
│   ├── awareness-graphics/  # Awareness campaign visuals
│   ├── hero-backgrounds/    # Full-width hero/banner images
│   ├── social-assets/       # Social media graphics and screenshots
│   ├── qr-graphics/         # QR code artwork and display graphics
│   ├── originals/           # Full-resolution originals (not deployed)
│   └── web-optimized/       # Compressed web-ready versions
│
├── qr-codes/                # QR code library (organized by purpose)
│   ├── website/
│   ├── events/
│   ├── donations/
│   ├── facebook/
│   ├── merch/
│   ├── memorials/
│   └── future-campaigns/
│
├── forms/                   # Form exports and templates
├── docs/                    # Internal documentation
├── resources/               # Public downloadable resources
├── downloads/               # Files served as public downloads
│
├── admin-assets/            # Admin system placeholders
│   ├── google-workspace/
│   ├── event-registration/
│   ├── donation-tracking/
│   ├── volunteer-forms/
│   ├── sponsor-info/
│   └── dashboard/
│
├── _archive/                # Archived/legacy files (not deployed)
└── website-backups/         # Pre-reorganization backups
```

---

## Branding

| Element | Value |
|---|---|
| Primary color | Purple `#8A2BEF` |
| Accent color | Teal `#00C9B1` |
| Background | Near-black `#0D0D0D` |
| Identity mark | Twisted semicolon |
| Tone | Cinematic, warm, community-centered |

---

## Pages

| Page | Purpose |
|---|---|
| `index.html` | Homepage — hero, mission statement, events teaser, CTA |
| `events.html` | Upcoming and past community events |
| `memorial.html` | Memorial tribute wall |
| `mental-health.html` | Mental health resources and support |
| `merch.html` | Awareness merch store |
| `shoe-drive.html` | Shoe drive campaign info |
| `stories.html` | Community story submissions |
| `suicide-awareness.html` | Suicide prevention resources |
| `three-rs.html` | The Three Rs program |
| `everyone-fidgets.html` | Everyone Fidgets sensory program |

---

## Missing Assets (Pre-GitHub Checklist)

- [ ] `images/rule62.jpg` — Artwork needed for three-rs.html (see placeholder note in that file)
- [ ] QR codes not yet generated — add to `/qr-codes/` subfolders
- [ ] Web-optimized image versions — compress originals and add to `images/web-optimized/`
- [ ] `favicon.ico` — Add brand favicon before deployment

---

## GitHub Pages Deployment

1. Push this folder as the root of a GitHub Pages repo
2. Enable Pages in repo Settings → Pages → Source: `main` branch, `/(root)`
3. Verify all relative image paths work at `https://[username].github.io/[repo]/`
4. Add custom domain in Pages settings if using `twiztedjourneysorganization.com`

---

## Future Systems

- **Story Submission System** — TJ Story System (separate repo, Netlify + Supabase) — links stories to handmade TJ items via QR tags
- **Event Registration** — Google Forms → Google Sheets integration
- **Admin Dashboard** — `/admin-assets/dashboard/` (future development)
- **QR Analytics** — Tracking clicks per QR campaign
- **Donation Platform** — PayPal Giving Fund, GoFundMe, or Stripe (to replace current mailto fallback)

---

## Organization

🎗️ **Twizted Journeys** | Mental Health Awareness Nonprofit  
📧 Contact: info@twiztedjourneys.org  
📘 Facebook: [Twizted Journeys](https://www.facebook.com/twiztedjourneys)  
🌐 Live site: [twiztedjourneys.org](https://www.twiztedjourneys.org)

---

*This README was generated as part of GitHub deployment preparation — May 2026*
