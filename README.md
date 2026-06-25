# Twizted Journeys — Website Project

**Organization:** Twizted Journeys, Inc.  
**Website:** twiztedjourneys.org  
**Mission:** Peer support, suicide loss survivor community, mental health awareness, and hope.  
**Location:** Shelbyville, Indiana (serving Shelby, Johnson, Bartholomew, Hancock, Decatur, Rush counties)  
**Founded:** 2021 | **Status:** 501(c)(3) Nonprofit  
**Founders:** Tonya Crump (CEO) & Tia Weaver (Co-Founder)

**Platform provider:** [NoCapsAI LLC](https://nocapsai.com)
**Provider support:** njwhitt@nocapsai.com

---

## Project Status

Migrating from Webador to GitHub Pages. This is a static HTML/CSS/JS site with no server-side dependencies.

---

## Folder Structure

```
twizted-journeys/
├── index.html                  ← Homepage
├── events.html                 ← Events page
├── stories.html                ← Story submission and sharing
├── memorial.html               ← Memorial wall
├── resources.html              ← Crisis/support resources
├── podcast.html                ← Podcast (coming soon)
├── merch.html                  ← Shop
├── about.html                  ← About Us
│
├── css/
│   └── styles.css              ← All site styles (brand colors, layout)
│
├── js/
│   └── main.js                 ← Mobile nav, active link logic
│
├── images/
│   ├── originals/              ← Full-res originals — DO NOT delete
│   │   └── twizted-journeys-logo-original.png
│   └── web-optimized/         ← Compressed versions for web use
│       ├── twizted-journeys-banner.jpg       (1500×500, 262KB)
│       ├── twizted-journeys-banner-mobile.jpg (768×256, 78KB)
│       └── hero-canva.jpg                    ← ⚠ PLACEHOLDER — see below
│
├── events/                     ← Event flyer images and assets
├── merch/                      ← Merch product photos
├── memorials/                  ← Memorial photos and assets
├── resources/                  ← Downloadable resource documents
├── downloads/                  ← Public downloadable files
├── qr-codes/
│   ├── website/
│   ├── events/
│   ├── donations/
│   ├── facebook/
│   ├── merch/
│   ├── memorials/
│   └── future-campaigns/
├── social-assets/              ← Logos, graphics for social media use
├── forms/                      ← Google Forms exports, spreadsheets
├── docs/                       ← Internal documents and guides
├── admin-assets/               ← Admin/dashboard references
└── website-backups/            ← Copies before major changes
```

---

## ⚠ Action Items Before GitHub Launch

### 1. Hero Image — REQUIRED
Tonya's Canva-edited hero image needs to replace the current placeholder.

- Export from Canva at **1500×500px** minimum (wider is fine)
- Save as: `images/web-optimized/hero-canva.jpg`
- Then in `index.html`, find the comment block that says `IMAGE PLACEHOLDER — ACTION NEEDED`
- Replace the `<img src="images/web-optimized/twizted-journeys-banner.jpg" ...>` line with:
  ```html
  <img src="images/web-optimized/hero-canva.jpg"
       alt="Twizted Journeys — Every Journey Matters"
       class="hero-banner" />
  ```

### 2. Donate Button — REQUIRED
Set up online donations (PayPal Giving Fund or Zeffy — both free for nonprofits).

- In `index.html`, find the comment `DONATE BUTTON — ACTION NEEDED`
- Replace `href="mailto:..."` with your actual donation link

### 3. Fix Social Media URLs
Update footer social links to use correct profile URLs (no spaces):
- Facebook: confirm the correct page URL
- Instagram: confirm @TwiztedJourneys handle

### 4. Events Page
Add real upcoming 2026 event details to `events.html` and `index.html`.

### 5. CNAME File (for GitHub Pages custom domain)
If pointing twiztedjourneys.org to GitHub Pages:
- Create a file named `CNAME` in this folder containing only: `twiztedjourneys.org`

---

## Brand Colors

| Name | Hex |
|------|-----|
| Twizted Purple | `#8A2BEF` |
| Journey Teal | `#56E0D2` |
| Glow Cyan Accent | `#9EF3F7` |
| Midnight BG | `#0B0B0F` |
| Soft Glow White | `#F8FBFF` |

---

## Safety & Content Rules (Permanent)

- Avoid overly casual language around sensitive topics
- Avoid unsupported nonprofit approval claims
- Do NOT present as crisis hotline, therapy, or medical service
- 988 crisis language MUST appear — currently in footer crisis band
- Story/podcast disclosure MUST appear on story and podcast pages
- Under-18 guardrail MUST appear on story submission and podcast pages
- "Every Journey Matters" — keep this wording
- Use proper nonprofit donation wording, e.g. "501(c)(3) nonprofit — donations may be tax-deductible as allowed by law"

---

## GitHub Pages Deployment

1. Push this folder to a GitHub repository named `twiztedjourneys` (or `twiztedjourneys.github.io`)
2. Go to Settings → Pages → Source: Deploy from branch → `main` → `/ (root)`
3. Add CNAME record in your domain registrar pointing to `twiztedjourneys.github.io`
4. Add the `CNAME` file to this folder with content: `twiztedjourneys.org`

---

## Contact

- **Email:** info@twiztedjourneys.org
- **WhatsApp:** (317) 604-3642
- **Facebook:** facebook.com/groups/560290368564902/

---

## Rights & Ownership

Copyright © 2026 NoCapsAI LLC. All rights reserved.

Twizted Journeys, Inc. retains ownership of its organization name, logos, mission language, stories, voice, approved podcast episodes, photos, videos, public descriptions, event information, nonprofit-specific materials, donor information, grant information, and other client-provided content. NoCapsAI LLC owns the underlying platform, reusable code, workflow systems, admin dashboards, interface structure, templates, prompts, safety review process, automation logic, publishing workflow, documentation structure, and implementation unless a separate written agreement states otherwise.

See [docs/LEGAL.md](docs/LEGAL.md) for the full ownership notice.
See [docs/NOCAPSAI_PLATFORM_DOMAINS.md](docs/NOCAPSAI_PLATFORM_DOMAINS.md) for approved grant writer, podcast workflow, and future studio domain notes.

---

*Built with care for Twizted Journeys, Inc. — Every Journey Matters.*
