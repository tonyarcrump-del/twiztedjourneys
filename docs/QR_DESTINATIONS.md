# Twizted Journeys — QR Code Destinations

This file is the permanent reference for all QR codes used on Twizted Journeys flyers,
table signs, merchandise, and outreach materials. Update QR image files; never change
destination URLs without updating this document and regenerating QR PNGs.

---

## 1. Events Page QR

| Field | Value |
|---|---|
| **QR Label** | Twizted Journeys — Events |
| **QR File** | `images/qr/qr-events.png` |
| **Destination URL** | `https://twiztedjourneys.org/events.html` |
| **Recommended Use** | Event flyers, ride/walk posters, social media, table signs at all events |
| **Print Notes** | Minimum 2 inches square on print materials. High-contrast black on white. Test scan before print run. |
| **Purpose** | Even if an old flyer is scanned, this QR always lands on the current Events page with up-to-date info. |

---

## 2. Shoe Drive QR

| Field | Value |
|---|---|
| **QR Label** | Twizted Journeys — Shoe Drive |
| **QR File** | `images/qr/qr-shoe-drive.png` |
| **Destination URL** | `https://twiztedjourneys.org/shoe-drive.html` |
| **Recommended Use** | Shoe drive flyers, donation box signs, business outreach, social media posts, event table materials |
| **Print Notes** | Minimum 2–2.5 inches square. Black QR on white background. Place on front of donation box. Test scan before printing. |
| **Purpose** | Reusable destination for all shoe drive outreach — how to donate, what's accepted, drop-off info, volunteer sign-up, and business/donation box hosting. |

---

## 3. Continue After the Pause QR (DTF Shirt Transfers)

| Field | Value |
|---|---|
| **QR Label** | Continue After the Pause |
| **QR File** | `images/qr/qr-continue-after-pause.png` |
| **Destination URL** | `https://twiztedjourneys.org/continue.html` |
| **Recommended Use** | DTF shirt transfers, awareness wear, memorial walk shirts, fundraiser apparel, table displays |
| **Print Notes** | See `DTF_SHIRT_QR.md` for full shirt layout and print specs. Minimum 2.5–3 inches wide on garment. Test scan before ordering transfers. |
| **Purpose** | When someone scans a shirt QR code, they land on a warm, mission-safe page that explains "Continue After the Pause," links to all key TJ pages, and includes 988 crisis language. |

---

## Regenerating QR Codes

QR PNG files were generated using the Python `qrcode` library with:
- Error correction: HIGH (H) — survives logo overlays, wear, and partial damage
- Box size: 14 px/module
- Border: 4 quiet-zone modules
- Output size: 600×600 px PNG

To regenerate (requires Python + `qrcode[pil]` + `Pillow`):

```python
import qrcode
from PIL import Image

qr = qrcode.QRCode(version=2, error_correction=qrcode.constants.ERROR_CORRECT_H, box_size=14, border=4)
qr.add_data("https://twiztedjourneys.org/events.html")
qr.make(fit=True)
img = qr.make_image(fill_color="black", back_color="white")
img.get_image().resize((600,600)).save("images/qr/qr-events.png")
```

Always test scan with multiple devices (iOS camera, Android camera, dedicated QR app) before printing.
