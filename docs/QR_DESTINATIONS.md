# Twizted Journeys — QR Campaign Destinations

This is the permanent reference for all QR codes used on Twizted Journeys flyers,
table signs, merchandise, shirts, and outreach materials.

**Admin panel:** `admin/qr-campaigns.html`  
**SQL migration for form campaigns:** `admin/sql/add-qr-campaign-flows.sql`

If a destination URL ever changes, update it here, regenerate the QR PNG in `images/qr/`,
and replace any printed materials that use that code.

---

## 1. Events QR

| Field | Value |
|---|---|
| **QR Label** | Events QR |
| **QR File** | `images/qr/qr-events.png` |
| **Destination URL** | `https://twiztedjourneys.org/events.html` |
| **Collects Form Data** | No |
| **Admin View** | `admin/qr-campaigns.html` |
| **Recommended Label Text** | Scan for Upcoming Events |
| **Recommended Use** | Event flyers, social media posts, table signage, business cards, printed outreach |
| **Print Notes** | Minimum 2 inches square. High-contrast black on white. Test scan before printing. |
| **Purpose** | Permanent, reusable QR for all event flyers. Even if an old flyer is scanned later, it always opens the current Events page. |

---

## 2. Shoe Drive QR

| Field | Value |
|---|---|
| **QR Label** | Shoe Drive QR |
| **QR File** | `images/qr/qr-shoe-drive.png` |
| **Destination URL** | `https://twiztedjourneys.org/shoe-drive.html` |
| **Collects Form Data** | No |
| **Admin View** | `admin/qr-campaigns.html` |
| **Recommended Label Text** | Scan for shoe drive details, drop-off locations, press release, and share materials. |
| **Recommended Use** | Shoe bins, flyers, press release, Cornstock materials, business counters, churches, schools, workplaces, Facebook graphics |
| **Print Notes** | Minimum 2–2.5 inches square. Black QR on white background. Place on front of donation box. Test scan before printing. |
| **Purpose** | Reusable QR for the active "Walk with a twizt" Shoe Drive campaign, including donation details, drop-off locations, press release, and share materials. |

---

## 3. Continue After the Pause QR

| Field | Value |
|---|---|
| **QR Label** | Continue After the Pause QR |
| **QR File** | `images/qr/qr-continue-after-pause.png` |
| **Destination URL** | `https://twiztedjourneys.org/continue.html` |
| **Collects Form Data** | No |
| **Admin View** | `admin/qr-campaigns.html` |
| **Recommended Label Text** | Scan to Follow the Journey |
| **Recommended Use** | DTF shirt transfers, awareness apparel, merch inserts, printed table materials |
| **Print Notes** | Minimum 2.5–3 inches wide on garment. See `docs/DTF_SHIRT_QR.md` for full shirt layout and print specs. |
| **Purpose** | DTF shirt transfer QR destination. Warm, mission-safe page explaining "Continue After the Pause," with links to Home, Events, Donate, Resources, Share Your Journey, and Twizted Treasures. Includes full 988 crisis language. |

---

## 4. Twizted Treasure Tracker

| Field | Value |
|---|---|
| **QR Label** | Twizted Treasure Tracker |
| **QR File** | `images/qr/qr-twizted-treasure-tracker.png` |
| **Destination URL** | `https://twiztedjourneys.org/twizted-treasure-checkin.html` |
| **Collects Form Data** | **Yes** |
| **Supabase Table** | `treasure_checkins` |
| **Admin View** | `admin/qr-campaigns.html` → View Submissions |
| **SQL Migration** | `admin/sql/add-qr-campaign-flows.sql` |
| **Recommended Label Text** | Scan to Continue This Treasure's Journey |
| **Recommended Use** | Charms, bracelets, stones, tags, small merch, giveaway items |
| **Print Notes** | Minimum 1.5–2 inches square (small item). Laminate if on a tag or stone carrier. |
| **Form Fields Collected** | Name/nickname (required), city (required), state (required), item type (optional), message (optional), email (optional) |
| **Privacy** | Submissions are not displayed publicly. Viewable only by authenticated admins in the admin panel. |
| **Fallback** | If Supabase tables are not yet created, form falls back to a pre-addressed mailto: link to info@twiztedjourneys.org. |
| **Purpose** | Reusable QR placed on any Twizted Treasure item so people can scan and share where the item ended up. Every Twizted Treasure is meant to travel — this lets the journey be tracked. |

---

## 5. Pause Spinner Check-In

| Field | Value |
|---|---|
| **QR Label** | Pause Spinner Check-In |
| **QR File** | `images/qr/qr-pause-spinner-checkin.png` |
| **Destination URL** | `https://twiztedjourneys.org/pause-spinner-checkin.html` |
| **Collects Form Data** | **Yes** |
| **Supabase Table** | `spinner_checkins` |
| **Admin View** | `admin/qr-campaigns.html` → View Check-Ins |
| **SQL Migration** | `admin/sql/add-qr-campaign-flows.sql` |
| **Recommended Label Text** | Scan After Your Pause |
| **Recommended Use** | Spinner tags, display stand signage, PT office table cards |
| **Print Notes** | Minimum 1.5 inches square. Laminate for durability — this is a repeated-use check-in. |
| **Form Fields Collected** | Name/nickname (required), spinner ID/color (optional), feeling before (dropdown, optional), feeling after (dropdown, optional), note (optional) |
| **Privacy** | Submissions are not displayed publicly. Viewable only by authenticated admins. Not connected to any clinical or medical record. |
| **Fallback** | If Supabase tables are not yet created, form falls back to a pre-addressed mailto: link to info@twiztedjourneys.org. |
| **Purpose** | Special QR for the three fidget spinners at the physical therapy location. Repeated-use check-in — not a traveling tracker. People can record when they used a spinner and how they felt. Twizted Journeys does not provide therapy or clinical care; this is a simple community engagement tool. |

---

## To Enable Live Form Submissions

The two form-based campaigns (Treasure Tracker, Pause Spinner) require two Supabase tables
that do not exist yet. To activate them:

1. Log in to [supabase.com](https://supabase.com) and open the Twizted Journeys project.
2. Go to **SQL Editor**.
3. Paste and run the contents of `admin/sql/add-qr-campaign-flows.sql`.
4. Verify both tables appear under **Database → Tables**.

Until the migration runs, both forms fall back gracefully to a pre-addressed `mailto:` link
so no submissions are lost.

---

## Regenerating QR Codes

All QR PNGs are in `images/qr/`. They were generated with Python `qrcode[pil]` + Pillow:

```python
import qrcode
from PIL import Image

qr = qrcode.QRCode(version=2, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=14, border=4)
qr.add_data("https://twiztedjourneys.org/DESTINATION")
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.get_image().resize((600, 600)).save("images/qr/QR-FILE.png")
```

Always test-scan with iOS camera, Android camera, and a dedicated QR app before printing.

---

*Last updated: June 2026*
