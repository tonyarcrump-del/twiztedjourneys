# DNS Cutover Checklist — Twizted Journeys
**Prepared for Tonya's final review and approval**
Last updated: May 2026

---

## What This Does
Moves twiztedjourneys.org from Webador to the new GitHub Pages site,
while keeping the Webador shop/donate pages alive at shop.twiztedjourneys.org.

**Nothing changes until Tonya says GO.**

---

## Step 1 — Before Touching Anything (do this first)
- [ ] Confirm the new GitHub Pages site looks correct at:
  `https://tonyarcrump-del.github.io/twiztedjourneys/` (preview URL)
- [ ] Test all pages on mobile (iPhone + Android)
- [ ] Confirm RSVP form submits to Supabase (test with a dummy entry)
- [ ] Confirm Memorial form submits to Supabase
- [ ] Confirm admin login works at `/admin/` with Tonya's credentials

---

## Step 2 — Create the shop. Subdomain (safe to do NOW, doesn't break anything)

**In Webador dashboard:**
1. Go to Settings → Domain → Custom Domain
2. Add `shop.twiztedjourneys.org` as an additional domain alias
3. Webador will now serve on both `www.twiztedjourneys.org` AND `shop.twiztedjourneys.org`

**In OpenProvider (DNS registrar):**
1. Log in to OpenProvider
2. Go to twiztedjourneys.org → DNS records
3. Add a new CNAME record:
   - **Name:** `shop`
   - **Value:** `website-rendering.webador.com`
   - **TTL:** 3600

4. Wait 15-30 minutes, then test: `https://shop.twiztedjourneys.org/donations-matter`
   - Should load the Webador donate page ✅

> **Note:** This step only ADDS a new record — it does NOT change www. or break the live site.

---

## Step 3 — Tonya Final Sign-Off
Before proceeding to Step 4, Tonya confirms:
- [ ] "The new site looks good on mobile and desktop"
- [ ] "Forms are working"
- [ ] "Admin panel works with my login"
- [ ] "shop.twiztedjourneys.org/donations-matter loads the donate page correctly"
- [ ] "I approve the DNS cutover"

**DO NOT proceed to Step 4 without this sign-off.**

---

## Step 4 — DNS Cutover (the actual switch)

**In OpenProvider, change the www record:**

Current state:
```
www  CNAME  website-rendering.webador.com
```

New state (GitHub Pages):
```
www  CNAME  tonyarcrump-del.github.io
```

Or if using apex domain (no www):
```
@   A   185.199.108.153
@   A   185.199.109.153
@   A   185.199.110.153
@   A   185.199.111.153
www CNAME  tonyarcrump-del.github.io
```

**In GitHub Pages settings:**
1. Go to github.com/tonyarcrump-del/twiztedjourneys → Settings → Pages
2. Under "Custom domain", enter: `twiztedjourneys.org`
3. Check "Enforce HTTPS"
4. Save

---

## Step 5 — After Cutover (verify within 1 hour)
- [ ] `https://twiztedjourneys.org` loads the new site ✅
- [ ] `https://www.twiztedjourneys.org` redirects to new site ✅
- [ ] `https://shop.twiztedjourneys.org/donations-matter` still loads Webador ✅
- [ ] `https://shop.twiztedjourneys.org/twizted-merch` still loads Webador ✅
- [ ] All donation buttons on new site go to shop.twiztedjourneys.org ✅
- [ ] Admin panel at twiztedjourneys.org/admin/ works ✅
- [ ] 988 crisis line visible on homepage ✅

---

## What Webador Keeps Running
Webador continues to handle **100% of**:
- All donations (donations-matter page)
- All product purchases (checkout/cart)
- All existing product listings
- PayPal integration

GitHub Pages handles:
- The main website (all informational pages)
- RSVP forms (via Supabase)
- Memorial submissions (via Supabase)
- Story submissions (via Supabase)
- Admin panel (Tonya's dashboard)

---

## Supabase Setup Status
- [x] Schema created — 3 tables live (shop_products, event_registrations, memorial_submissions)
- [x] Both admin users invited (natewhittaker91@gmail.com + tonyarcrump@gmail.com)
- [ ] Supabase URL Configuration → Site URL must be set to:
  `https://tonyarcrump-del.github.io/twiztedjourneys/admin/index.html` (pre-cutover)
  Then updated to `https://twiztedjourneys.org/admin/index.html` after DNS cutover
- [ ] Confirm admin login works for both Nate and Tonya

---

## Emergency Rollback
If anything breaks after cutover:
1. In OpenProvider, change `www CNAME` back to `website-rendering.webador.com`
2. DNS propagates within 1 hour — site is back on Webador
3. Nothing is permanently deleted

---

*Prepared by Nate / Claude AI — for Tonya Crump's final approval*
