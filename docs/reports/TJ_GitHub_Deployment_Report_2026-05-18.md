# Twizted Journeys — GitHub Deployment Preparation Report
**Generated:** May 18, 2026
**Prepared by:** Claude (Cowork mode)
**Project root:** C:\Twisted Journeys\TJ_Website_Local

---

## 1. AUDIT FINDINGS (Pre-Cleanup State)

### Critical Issue Resolved
All 10+ HTML files referenced images as `images/filename.png` but every file physically lived inside `images/image/filename.png` — a nested subfolder that didn't match the paths. This meant **every single image on the live website was broken**. This has been fully corrected: all images are now at `images/filename.png` where HTML expects them.

### Duplicate Files Found & Resolved

| File A | File B | Action |
|---|---|---|
| `images/banner.png` | `images/b473ceb5-...png` | Identical — renamed to `hero-banner-main.png`, UUID version archived |
| `what-comes-after-the-pause-promo.png` | `what-comes-after-the-pause-promo-2.png` | Identical — both kept (both referenced), noted |
| `images/(No subject)/image000000(1).png` | `images/(No subject)/image000000(1) - Copy.png` | Exact copy — Copy version archived |
| `images/(No subject)/image000001(2).png` | `images/(No subject)/image000001(3).png` | Identical feather-quill — archived |
| Root `Bad_Shoes.png` | `TJ_Website_Local/images/image/Bad_Shoes.png` | Same file in two locations — consolidated |
| Root `Good_Shoes.png` | `TJ_Website_Local/images/image/Good_Shoes.png` | Same file in two locations — consolidated |
| Root `logo.png` | `images/image/logo-neon.png` | Same file — logo.png is logo-neon.png |
| Root `image000001(4) (1).png` | `images/image/vendor-event-flyer.png` | Same file — consolidated |

### The (No subject) Folder — Decoded
All files in this folder were duplicates of already-named project files downloaded in a batch. Fully archived to `_archive/root-images-original/`. Zero unique content lost.

---

## 2. IMAGE ORGANIZATION COMPLETED

### Images now at `images/` root (HTML-ready — all 10 references VERIFIED OK)
- Bad_Shoes.png
- Good_Shoes.png
- feather-quill.png
- logo-neon.png
- tj-brush-logo.png
- tj-cursive-logo.png
- tj-road.png
- vendor-event-flyer.png
- what-comes-after-the-pause-logo.png
- what-comes-after-the-pause-promo.png
- *(+ hero-banner-main.png, what-comes-after-the-pause-promo-2.png, tj-handlettered-logo.jpg)*

### Category Subfolders (organized)
| Folder | Contents |
|---|---|
| `images/logos/` | tj-brush-logo, tj-cursive-logo, tj-handlettered-logo, logo-neon |
| `images/events/` | 44 event photos and collages (2022–2024) |
| `images/flyers/` | vendor-event-flyer |
| `images/merch/` | Bad_Shoes, Good_Shoes, merch-item-6170, merch-item-6174, merch-item-7631 |
| `images/awareness-graphics/` | feather-quill, what-comes-after-the-pause assets, awareness-graphic items |
| `images/hero-backgrounds/` | tj-road, hero-banner-main |
| `images/social-assets/` | Facebook photos, social graphics, awareness posts |
| `images/originals/` | All full-resolution originals (67 files — NOT deployed to GitHub) |

---

## 3. FILES RENAMED (Cryptic → Readable)

### From Downloads (52 files copied + renamed)
| Original | Renamed To | Category |
|---|---|---|
| incollage_20220619_013933829.jpg | event-collage-jun2022-5.jpg | events |
| incollage_20220619_013506495.jpg | event-collage-jun2022-4.jpg | events |
| incollage_20220619_013153869.jpg | event-collage-jun2022-3.jpg | events |
| incollage_20220301_232129591.jpg | event-collage-mar2022-1.jpg | events |
| incollage_20220315_154816022.jpg | event-collage-mar2022-5.jpg | events |
| incollage_20220410_212312279.jpg | event-collage-apr2022.jpg | events |
| incollage_20220503_090046675.jpg | event-collage-may2022-3.jpg | events |
| incollage_20220503_090243638.jpg | event-collage-may2022-4.jpg | events |
| incollage_20220503_090515065.jpg | event-collage-may2022-5.jpg | events |
| incollage_20220604_000520159.jpg | event-collage-jun2022-1.jpg | events |
| incollage_20240409_172529441-high.jpg | event-collage-apr2024.jpg | events |
| incollage_20220801_212146732-standard.jpg | event-collage-aug2022-1.jpg | events |
| incollage_20220802_110441281-standard.jpg | event-collage-aug2022-2.jpg | events |
| incollage_20220815_080535163-standard.jpg | event-collage-aug2022-3.jpg | events |
| 20220428_121530.jpg | event-photo-apr2022.jpg | events |
| 20220810_121425-standard.jpg | event-photo-aug2022-2.jpg | events |
| 20220810_121425-high.jpg | event-photo-aug2022-2-hires.jpg | events |
| 20220810_121456-standard.jpg | event-photo-aug2022-3.jpg | events |
| 20220913_161420-standard.jpg | event-photo-sep2022-1.jpg | events |
| 20220913_161614-standard.jpg | event-photo-sep2022-2.jpg | events |
| 20220915_154000-standard.jpg | event-photo-sep2022-3.jpg | events |
| received_389971753214285-standard.jpg | event-photo-received-1.jpg | events |
| received_645867403566827-standard.jpg | event-photo-received-2.jpg | events |
| received_645867403566827-high.jpg | event-photo-received-2-hires.jpg | events |
| 1000025230-high.jpg | event-photo-community-1-hires.jpg | events |
| 1000027988-standard.jpg | event-photo-community-2.jpg | events |
| 1000028880 through 1000028896 (series) | event-photo-community-3 through -11 | events |
| fb_img_1712779501412-high.jpg | facebook-photo-apr2024.jpg | social-assets |
| english-_20250318_120035_0000-high.jpg | awareness-post-mar2025.jpg | social-assets |
| f2xpxc-high.jpg | social-graphic-1.jpg | social-assets |
| img_20250304_152923-high-wq4gwn.jpg | social-photo-mar2025.jpg | social-assets |
| image-high.png | social-graphic-unknown.png | social-assets |
| download2.jpeg | downloaded-graphic-1.jpg | social-assets |
| 6170-standard.png | merch-item-6170.png | merch |
| 6174-high.png | merch-item-6174-hires.png | merch |
| 7631-high.png | merch-item-7631-hires.png | merch |
| banner.png | hero-banner-main.png | hero-backgrounds |

### Documents organized (root → docs/ subfolders)
18 Word/PDF files moved from loose root into `docs/press-releases/`, `docs/event-docs/`, `docs/social-media/`, `docs/reports/`.

---

## 4. MISSING ASSETS

| Asset | Status | Action Needed |
|---|---|---|
| `images/rule62.jpg` | Not a real broken link — it's inside a `<code>` instruction block in three-rs.html | Create/commission artwork; filename `images/rule62.jpg` |
| `favicon.ico` | Missing from project entirely | Create 32x32 favicon with twisted semicolon mark |
| `images/web-optimized/` | Folder exists but empty | Compress all images with squoosh.app or TinyPNG before GitHub push |
| QR codes in `/qr-codes/` | All folders empty (READMEs added) | Generate QR codes via Canva or qr-code-generator.com |
| incollage_20220303, _20220313 | Not found in Downloads | May have been deleted or moved — check phone/Facebook |
| addtext, screenshot_facebook files | Not found in Downloads | Likely deleted — check Facebook for re-download |

---

## 5. FOLDER STRUCTURE CREATED

### TJ_Website_Local/ (website deploy root)
```
admin-assets/      google-workspace/, event-registration/, donation-tracking/,
                   volunteer-forms/, sponsor-info/, dashboard/
docs/              press-releases/, event-docs/, reports/, social-media/
downloads/         (public PDF downloads)
forms/             (Google Forms exports)
images/            logos/, events/, flyers/, merch/, memorials/, awareness-graphics/,
                   hero-backgrounds/, social-assets/, qr-graphics/,
                   originals/, web-optimized/
qr-codes/          website/, events/, donations/, facebook/, merch/, memorials/,
                   future-campaigns/
resources/         (public resource docs)
_archive/          (legacy/backup files — not deployed)
```

### C:\Twisted Journeys/ (root project)
```
docs/              press-releases/, event-docs/, reports/, social-media/
admin/             (future admin files)
website-backups/   TJ_Website_Local_backup_2026-05-18_0927/
                   TJ_Root_Loose_Files_backup_2026-05-18_0927/
```

---

## 6. RECOMMENDED NEXT STEPS BEFORE GITHUB PUSH

### Must Do Before Push
1. **Compress images** — Use squoosh.app to create web-optimized versions (target under 200KB each for web images)
2. **Create favicon.ico** — 32x32 twisted semicolon mark; place in root
3. **Commission rule62.jpg** — Artwork for the Three Rs page
4. **Test locally** — Open index.html in browser, verify all images load

### Strongly Recommended
5. **Generate QR codes** — At minimum: website QR and Facebook QR
6. **Add to .gitignore** — `images/originals/` is already in .gitignore; confirm it stays off GitHub
7. **Review three-rs.html** — Contains developer instruction comments that should be cleaned before going live

### Future Infrastructure (Post-Launch)
8. Connect Google Workspace for forms/registration
9. Set up GitHub Actions for automatic deploy on push
10. Configure custom domain in GitHub Pages settings
11. Build admin dashboard from `/admin-assets/dashboard/`
12. Integrate TJ_Story_System for community story submissions

---

## 7. GITHUB SAFETY CHECKLIST

| Check | Status |
|---|---|
| All filenames lowercase | ✅ New files use lowercase-hyphen naming |
| No spaces in filenames | ✅ New files have no spaces |
| No special characters in paths | ✅ Verified |
| Relative image paths in HTML | ✅ All use `images/filename` (no absolute paths) |
| .gitignore created | ✅ Excludes node_modules, .env, originals, backups |
| README.md created | ✅ Full project documentation |
| Sensitive files excluded | ✅ admin-assets/donation-tracking/ in .gitignore |
| HTML image references verified | ✅ All 10 referenced images exist at correct paths |
| Backup created | ✅ website-backups/TJ_Website_Local_backup_2026-05-18_0927 |

---

## 8. WHAT WAS NOT TOUCHED

- No HTML content was modified (only structure around it)
- No CSS was modified
- No donation/payment links were touched
- No live banking or payment systems accessed
- Original files preserved in `images/originals/` and `_archive/`
- hope-signal-ai/ project left completely untouched
- TJ_Story_System/ left completely untouched
- TJ_Event_Agent/ left completely untouched

---

*Report complete. The project is organized, backed up, and structurally ready for GitHub Pages deployment.*
*Primary remaining blocker: image compression + favicon before push.*
