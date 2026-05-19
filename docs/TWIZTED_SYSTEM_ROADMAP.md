# Twizted Journeys — System Integration Roadmap

**Status:** Planning only. No merges. No file moves. No DNS changes.
**Last updated:** May 2026
**Owner:** Nate (technical lead) + Tonya Crump (content + brand decisions)

---

## Quick Reference: Wednesday vs. After Wednesday

| Priority | Wednesday (meeting-ready) | After Wednesday |
|---|---|---|
| Website | Polished GitHub preview live | Full hosting migration plan |
| Events | Sept. 12-13 artwork, RSVP links | Event intake agent connected |
| QR | Placeholder "Scan & Share" section | Real QR codes generated + printed |
| Stories | Static Share Your Story page | Story System (Supabase) connected |
| Podcast | "Coming Soon" section | hope-signal-ai platform launched |
| Promo Builder | Agent exists, used manually | Integrated into admin dashboard |
| Admin | Folder exists, empty | Dashboard built and connected |
| Images | Cleaned up in official repo | Duplicate folders resolved |

---

## 1. Public Website

**Folder:** C:\Projects\twiztedjourneys-official
**Role:** The only folder that publishes to the live GitHub Pages preview. Everything a donor, funder, community member, or press contact sees comes from here.
**Stack:** Static HTML + CSS + vanilla JS. GitHub Pages. No server-side code.

**Current state (May 2026):**
- 13 public pages, all using css/styles.css design system
- Homepage: parallax hero (what-comes-after-the-pause-promo.png), mission, what we do, upcoming events, donate, resources, stories, QR placeholder, podcast teaser
- Events page: Sept. 12-13 artwork attached to event cards, vendor flyer in vendor section
- Zero broken image references; zero forbidden phrases; zero unconfirmed social links
- Donate links point to https://www.twiztedjourneys.org/donations-matter (Webador)
- Facebook Group link confirmed: https://www.facebook.com/groups/560290368564902/

**Before Wednesday:** Final review by Nate and Tonya, then git push.
**After Wednesday:** Hosting migration plan, subdomain strategy, image folder cleanup.

---

## 2. QR / Event Agent

**Folder:** C:\Twisted Journeys\TJ_Event_Agent
**Files:** SKILL.md, INTAKE_TEMPLATE.md, TJ_Event_Agent_Spec.docx
**Role:** A Claude agent skill that takes rough event notes and outputs complete promotional content kits: flyer copy, Facebook posts, website content, QR destination plans, vendor posts, and reminder sequences.

**Key rules (from SKILL.md):**
- Brand voice: real, human, compassionate -- never corporate
- Tagline: "Give tomorrow a chance."
- Always include 988 on printed flyers and resource tables
- Tonya's artwork is always primary -- never replace with AI art
- QR codes go in clean corners or separate labeled blocks, never over artwork

**Current state:** Specification only. Not yet connected to a live QR generator or the website.
**Before Wednesday:** Use manually for any last-minute event promo copy needed.
**After Wednesday:** Connect to a QR generation service. Generate real QR codes for Donate, Events, Stories, Merch, and Facebook Group. Print physical cards. Wire the homepage "Scan & Share" section to real destinations.

---

## 3. Promo Builder

**Folder:** C:\Twisted Journeys\Twizted Promo Builder
**Files:** INSTRUCTIONS.md
**Role:** A Claude agent for flyers, Facebook posts, website section copy, merch promos, event announcements, and QR destination plans. Uses the same brand voice and color system as the main site.

**Relationship to TJ_Event_Agent:** These two tools overlap significantly. After Wednesday, audit the overlap and decide whether to merge them into one "Promo & Content Agent" or keep separate scopes.

**Current state:** INSTRUCTIONS.md only -- Claude prompt/skill specification. No code.
**Before Wednesday:** Use manually as needed.
**After Wednesday:** Audit overlap with TJ_Event_Agent. Consider a simple web UI so Tonya can generate promos without needing Claude directly.

---

## 4. Story System

**Folder:** C:\Twisted Journeys\TJ_Story_System
**Files:** story.html, admin.html, qr-tag.html, thankyou.html, schema.sql, config.js, SETUP.md, _redirects
**Role:** A QR-linked web app that lets people scan a code on a handmade Twizted item, land on a private story form, and share what the piece means to them. Stories are private by default. Tonya reviews and approves from an admin panel.

**Stack:** Static HTML front-end + Supabase (PostgreSQL) + Netlify (hosting). Schema defined in schema.sql.

**Current state:** Fully specced and built. Awaits Supabase + Netlify setup (approx. 30-45 minutes per SETUP.md). Not yet live.

**Connection to website:** The "Share Your Journey" section links to stories.html. Currently static (sends to email). After Story System is live, stories.html can link to or embed the Supabase-backed form.

**Before Wednesday:** Keep stories.html as a static email form. No Supabase setup needed yet.
**After Wednesday:** Complete Supabase + Netlify setup. Generate QR tags for handmade items. Connect stories.html to the live system.

---

## 5. Podcast Platform

**Folder:** C:\Twisted Journeys\hope-signal-ai
**Files:** Next.js app, Prisma schema, Tailwind, TypeScript, .env files
**Role:** A Next.js platform for the Twizted Journeys / Hope Signal podcast. Human-hosted. AI assists with outlines, transcripts, show notes, summaries, captions, and admin workflow -- AI is not the host and does not provide therapy or crisis support.

**CRITICAL:** .env and .env.local contain credentials. These must NEVER be committed to a public GitHub repo.

**Current state:** Full codebase exists locally. node_modules present. Not yet deployed.

**Connection to website:** podcast.html currently shows "Coming Soon." Once hope-signal-ai is deployed, that page links to the live platform.

**Before Wednesday:** Keep "Coming Soon" teaser. Do not deploy hope-signal-ai before the meeting.
**After Wednesday:** Choose a host (Vercel recommended for Next.js). Set up production env variables. Deploy and test. Update podcast.html. Rotate credentials in .env files before any public deployment.

---

## 6. Admin Dashboard

**Folder:** C:\Twisted Journeys\admin
**Role:** Future central dashboard for Tonya/Nate to manage stories, approve content, trigger promo generation, view QR scan analytics, and manage event details from one place.

**Current state:** Empty folder. Placeholder only.

**Before Wednesday:** Nothing needed.
**After Wednesday:** Decide scope (lightweight HTML vs. full Next.js app). Consider extending hope-signal-ai admin tools to cover story review and promo management (avoids three separate admin UIs). Add authentication before storing sensitive community data.

---

## 7. What Must Be Ready Before Wednesday

1. Homepage -- parallax hero, mission, what we do, upcoming events, donate, resources, stories, scan & share placeholder, podcast teaser
2. Events page -- Sept. 12-13 artwork in event cards, vendor flyer in vendor callout, all RSVP/vendor email links working
3. All donate links pointing to https://www.twiztedjourneys.org/donations-matter
4. Crisis band (988) compact and consistent on all pages
5. Zero broken images, zero forbidden phrases, zero unconfirmed social links
6. Nate reviews, then git push to GitHub Pages
7. Confirm twiztedjourneys.org resolves correctly

---

## 8. What Must Wait Until After Wednesday

- Supabase + Netlify setup for Story System
- hope-signal-ai deployment
- Real QR code generation and printing
- Merging Promo Builder + Event Agent into one tool
- Building the admin dashboard
- Cleaning duplicate image folders
- Reorganizing official repo images/ into subfolders (requires updating all HTML refs simultaneously)
- Adding Instagram (@twiztedjourney) -- confirm final URL with Tonya first
- Adding Tumblr, X, or TikTok -- none confirmed yet
- Production hosting decisions for hope-signal-ai
- Database/storage strategy for community content
- Removing unused images from official repo root

---

## 9. Suggested Final Architecture

```
PUBLIC WEBSITE (GitHub Pages or upgraded host)
twiztedjourneys.org
  index.html         Homepage (SEO, donate, events preview, mission)
  events.html        Event details + artwork + RSVP
  stories.html  ---- links to ----> STORY SYSTEM (Netlify + Supabase)
  podcast.html  ---- links to ----> PODCAST PLATFORM (Vercel)
  resources.html     Static resource library
  memorial.html      Memorial
  merch.html         Shop (links to Webador)
  donate             Always redirects to Webador Donations Matter page

STORY SYSTEM (Netlify + Supabase)
stories.twiztedjourneys.org
  story.html         QR-linked story submission form
  thankyou.html      Confirmation
  qr-tag.html        QR landing for physical handmade items
  admin.html         Tonya review dashboard

PODCAST PLATFORM (Vercel / hope-signal-ai)
podcast.twiztedjourneys.org
  Next.js app
  Episode pages, show notes, transcripts
  Admin: episode management, captions, show notes

PROMO & QR AGENT (Claude / internal tool)
  Used by Tonya/Nate to generate:
    Flyer copy + Facebook posts
    QR code destination plans
    Website section copy
    Vendor + event announcements

ADMIN DASHBOARD (future V1)
admin.twiztedjourneys.org (password-protected)
  Story approval queue
  Promo generation launcher
  QR scan analytics
  Event management

IMAGE STORAGE (after cleanup)
twiztedjourneys-official/images/
  brand/      logo, banners, web-optimized
  events/     event photos, collages, flyers, promo art
  merch/      product photos
  awareness/  awareness graphics, road, semicolon
  shoe-drive/ Good_Shoes, Bad_Shoes
```

---

## 10. Folder Cleanup Plan (after Wednesday)

**Duplicate image folders to resolve:**

| Folder | Role | Action after Wednesday |
|---|---|---|
| C:\Twisted Journeys\images\ | Raw originals from Tonya | Keep as archive. Do not delete. |
| C:\Twisted Journeys\TJ_Website_Local\images\ | Old working copy | Archive after confirming official repo has everything |
| C:\Projects\twiztedjourneys-official\images\ | Live repo -- source of truth | Organize into subfolders + update HTML refs |

**Temp build files to remove from official repo before next push or shortly after:**
- _build_index.py
- _patch_cards.py
- _patch_events.py
- _patch_index.py
- _patch_hero.py

**TJ_Website_Local fate:**
Once the official repo is live and Tonya confirms it looks correct, TJ_Website_Local becomes an archive. Do not delete until then.

---

## Key Constraints (always)

- Do not touch DNS, CNAME.hold, Webador settings, payment settings, shipping, checkout, or private links
- Donate always links to https://www.twiztedjourneys.org/donations-matter
- Only confirmed social link: Facebook Group https://www.facebook.com/groups/560290368564902/
- Do not add Instagram, TikTok, Tumblr, or X until Tonya confirms exact URLs
- hope-signal-ai/.env and .env.local must NEVER be committed to a public repo
- 988 crisis band must remain visible on all public pages
- Tonya's original artwork is always primary -- never replace with AI-generated images

---

*This document is a planning reference only. No merges, deployments, or infrastructure changes should happen from this file alone. All actions require Nate's review.*