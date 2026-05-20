# Twizted Journeys — Admin & Inventory System Plan

**Status:** Planning only. No accounts created. No code deployed.
**Last updated:** May 2026
**Author:** Nate (technical lead)
**Reviewer:** Tonya Crump

---

## Quick Reference

| Feature | Tool | Status |
|---|---|---|
| Story System (merch_items, story_submissions, scan_log) | Supabase + Netlify | **Built. Awaiting account setup.** |
| Admin login (Tonya) | Netlify Identity | Planned |
| Inventory / shop products | Supabase (extend existing project) | Planned |
| Product photo uploads | Supabase Storage | Planned |
| Event registrations | Supabase OR Netlify Forms | Planned — see Section 10 |
| Memorial submissions | Supabase (new table) | Planned |
| All existing pages | Static HTML / GitHub Pages → Netlify | Migration needed |
| Payments / donations / checkout | **Webador only — do not touch** | Permanent constraint |

---

## Section 1 — What Already Exists (Do Not Rebuild)

The TJ_Story_System folder at C:\Twisted Journeys\TJ_Story_System\ is a complete, deployable app:

- **schema.sql** — three tables already defined: `merch_items`, `story_submissions`, `scan_log`
- **admin.html** — item management, QR generation, story review queue
- **story.html** — public-facing story submission form (QR-linked)
- **config.js** — single config file for Supabase keys, URLs, admin password
- **_redirects** — Netlify clean URL rules
- **SETUP.md** — 30–45 minute account and deploy guide

**The plan below extends this foundation.** New tables go in the same Supabase project.
The admin panel gets upgraded with Netlify Identity instead of the current password-in-config approach.

---

## Section 2 — Architecture Decision

### Hosting: GitHub Pages → Netlify

GitHub Pages only serves static files. Everything dynamic (forms with storage, admin auth,
clean URLs) requires more. Netlify gives us all three on the free plan with zero server management.

**Migration is low-risk:** The site is static HTML. Netlify reads the same GitHub repo.
Point Netlify at the repo, set a custom domain, done.
GitHub Pages continues working until DNS is pointed over.

### Authentication: Netlify Identity (Invite-Only)

Netlify Identity is a hosted auth system built into Netlify. It handles:
- Email + password login
- JWT tokens (passed to Supabase as auth headers)
- Invite-only mode — no public signup button
- Password reset by email

**Tonya's login flow:**
1. Nate invites Tonya via email from the Netlify dashboard
2. Tonya receives invite email, sets her password
3. She goes to /admin — Netlify Identity widget shows login form
4. She logs in — JWT token stored in her browser
5. Admin JS uses token to make authenticated Supabase requests
6. Stays logged in until logout or token expiry (1 hour, auto-refreshes)

**Why not a password in config.js?**
The current Story System approach (adminPassword in config.js) is visible to anyone
who views page source. Fine for a low-stakes tool, but not right for a panel that stores
event registrations and memorial submissions. Netlify Identity is the correct upgrade.

### Database: One Supabase Project, Extended

Do not create a second Supabase project. Extend the existing schema from
TJ_Story_System/schema.sql with three new tables:
- `shop_products` — inventory and shop display
- `event_registrations` — RSVP, vendor, and volunteer signups
- `memorial_submissions` — submitted memorials awaiting approval

The existing three tables (merch_items, story_submissions, scan_log) stay as-is.

---

## Section 3 — Exact Tables Needed

### Existing Tables (no changes required)

Already defined in TJ_Story_System/schema.sql. Do not re-run these.

```
merch_items         Handmade items (bracelets, cups, keychains) with QR tracking
story_submissions   Stories submitted via QR scan form
scan_log            One row per QR scan (item_id + timestamp)
```

---

### New Table 1: shop_products

Shop products are different from handmade merch items. These are sellable inventory
(counted in units, not individually tracked). Webador handles actual checkout —
this table drives what the site displays and tracks available quantity.

```sql
CREATE TABLE shop_products (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku              TEXT NOT NULL UNIQUE,
  name             TEXT NOT NULL,
  description      TEXT,
  category         TEXT NOT NULL
                     CHECK (category IN (
                       'charm','apparel','accessory','awareness','bundle','other'
                     )),
  price_cents      INTEGER NOT NULL DEFAULT 0,    -- 1200 = $12.00 (display only, Webador charges)
  quantity_total   INTEGER NOT NULL DEFAULT 0,    -- total units ever stocked
  quantity_sold    INTEGER NOT NULL DEFAULT 0,    -- updated manually after Webador sales
  quantity_held    INTEGER NOT NULL DEFAULT 0,    -- reserved but not confirmed
  is_hidden        BOOLEAN NOT NULL DEFAULT FALSE,
  is_sold_out      BOOLEAN NOT NULL DEFAULT FALSE, -- manual sold-out override
  photo_url        TEXT,                           -- Supabase Storage URL or repo path
  photo_alt        TEXT,
  webador_link     TEXT,                           -- full URL to Webador product listing
  sort_order       INTEGER NOT NULL DEFAULT 0,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Computed quantity view (total minus sold minus held)
CREATE VIEW shop_products_with_available AS
SELECT *, (quantity_total - quantity_sold - quantity_held) AS quantity_available
FROM shop_products;

CREATE INDEX idx_products_category ON shop_products(category);
CREATE INDEX idx_products_hidden   ON shop_products(is_hidden);
CREATE INDEX idx_products_sort     ON shop_products(sort_order);

CREATE TRIGGER trg_shop_products_updated_at
  BEFORE UPDATE ON shop_products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Row Level Security
ALTER TABLE shop_products ENABLE ROW LEVEL SECURITY;

-- Public (anon key): read non-hidden products only
CREATE POLICY "Public can read visible products"
  ON shop_products FOR SELECT USING (is_hidden = FALSE);

-- Admin (authenticated): full access
CREATE POLICY "Authenticated users can manage products"
  ON shop_products FOR ALL USING (auth.role() = 'authenticated');
```

---

### New Table 2: event_registrations

Captures RSVPs, vendor applications, and volunteer signups for events.

```sql
CREATE TABLE event_registrations (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Which event
  event_name         TEXT NOT NULL,
  event_date         DATE,
  registration_type  TEXT NOT NULL
                       CHECK (registration_type IN (
                         'attendee','vendor','volunteer','rider','walker'
                       )),

  -- Contact info
  first_name         TEXT NOT NULL,
  last_name          TEXT NOT NULL,
  email              TEXT NOT NULL,
  phone              TEXT,

  -- Vendor-specific (null for non-vendors)
  business_name      TEXT,
  vendor_type        TEXT,           -- food, handmade, nonprofit, service
  vendor_notes       TEXT,
  needs_table        BOOLEAN DEFAULT FALSE,
  needs_electricity  BOOLEAN DEFAULT FALSE,

  -- Volunteer-specific
  volunteer_role     TEXT,           -- check-in, setup, food, general

  -- Attendee count
  guest_count        INTEGER DEFAULT 1,

  -- General
  notes              TEXT,
  how_did_you_hear   TEXT,

  -- Admin workflow
  status             TEXT NOT NULL DEFAULT 'pending'
                       CHECK (status IN ('pending','confirmed','waitlisted','cancelled')),
  admin_notes        TEXT,
  confirmed_at       TIMESTAMPTZ,

  -- Metadata
  created_at         TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash            TEXT
);

CREATE INDEX idx_reg_event   ON event_registrations(event_name);
CREATE INDEX idx_reg_type    ON event_registrations(registration_type);
CREATE INDEX idx_reg_status  ON event_registrations(status);
CREATE INDEX idx_reg_date    ON event_registrations(created_at DESC);

ALTER TABLE event_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can register"
  ON event_registrations FOR INSERT WITH CHECK (TRUE);

CREATE POLICY "Authenticated can read registrations"
  ON event_registrations FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated can update registrations"
  ON event_registrations FOR UPDATE USING (auth.role() = 'authenticated');
```

---

### New Table 3: memorial_submissions

Public submissions for the memorial wall, reviewed by Tonya before display.

```sql
CREATE TABLE memorial_submissions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Who is being honored
  honoree_name          TEXT NOT NULL,
  honoree_birth_year    INTEGER,
  honoree_passing_year  INTEGER,

  -- The story
  relationship          TEXT,             -- "my son", "my friend", "my client"
  story                 TEXT NOT NULL,
  message_of_hope       TEXT,

  -- Submitter info
  submitted_by_name     TEXT,
  submitted_by_email    TEXT,
  submitted_by_city     TEXT,

  -- Photo
  photo_url             TEXT,
  photo_caption         TEXT,

  -- Permissions
  display_name          TEXT NOT NULL DEFAULT 'anonymous'
                          CHECK (display_name IN ('full_name','first_only','anonymous')),
  share_permission      BOOLEAN NOT NULL DEFAULT FALSE,
  consent_given         BOOLEAN NOT NULL DEFAULT FALSE,

  -- Admin workflow
  status                TEXT NOT NULL DEFAULT 'pending'
                          CHECK (status IN ('pending','approved','rejected','needs_edit')),
  admin_notes           TEXT,
  reviewed_at           TIMESTAMPTZ,
  reviewed_by           TEXT,
  approved_at           TIMESTAMPTZ,

  -- Display control
  is_featured           BOOLEAN NOT NULL DEFAULT FALSE,
  display_order         INTEGER DEFAULT 0,

  -- Metadata
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ip_hash               TEXT
);

CREATE INDEX idx_mem_status   ON memorial_submissions(status);
CREATE INDEX idx_mem_approved ON memorial_submissions(approved_at DESC);
CREATE INDEX idx_mem_featured ON memorial_submissions(is_featured);

ALTER TABLE memorial_submissions ENABLE ROW LEVEL SECURITY;

-- Public can submit
CREATE POLICY "Public can submit memorials"
  ON memorial_submissions FOR INSERT WITH CHECK (consent_given = TRUE);

-- Public reads only approved entries that granted share permission
CREATE POLICY "Public can read approved memorials"
  ON memorial_submissions FOR SELECT
  USING (status = 'approved' AND share_permission = TRUE);

-- Admin reads and manages everything
CREATE POLICY "Authenticated can manage memorials"
  ON memorial_submissions FOR ALL USING (auth.role() = 'authenticated');
```

---

## Section 4 — Supabase Storage Buckets

| Bucket | Purpose | Public? | Max size |
|---|---|---|---|
| product-photos | Shop product images uploaded by Tonya | Yes (CDN, used in img tags) | 5MB |
| memorial-photos | Photos submitted with memorial entries | No (admin-only, signed URLs) | 5MB |

Public product-photos URL format:
  https://[project-id].supabase.co/storage/v1/object/public/product-photos/[filename]

**Phase 1 alternative for product photos:** Place images in the GitHub repo at
public/assets/images/products/ and use relative paths. No upload UI needed initially.
Move to Supabase Storage uploads in Phase 2 once admin panel is stable.

---

## Section 5 — Admin Login Flow (Netlify Identity)

```
Tonya visits https://twiztedjourneys.org/admin
       |
       v
Netlify Identity widget loads (JavaScript, no server needed)
       |
       v
Login form: email + password
(First time: she sets password from the invite email Nate sent)
       |
       v
Netlify validates credentials -> JWT token stored in browser localStorage
       |
       v
Admin JS includes token in all Supabase API calls:
  Authorization: Bearer [token]
       |
       v
Supabase grants 'authenticated' role -> RLS allows read/write on all tables
       |
       v
Admin dashboard tabs:
  Products   -- add/edit/hide shop_products, update photo URL or path
  Inventory  -- update quantity_sold/quantity_held per product
  Items      -- handmade merch_items + QR generation (existing, from Story System)
  Stories    -- story_submissions review queue (existing, from Story System)
  Events     -- event_registrations by event and type, CSV export
  Memorials  -- memorial_submissions queue, approve/reject, set featured
```

Token expires after 1 hour and auto-refreshes while Tonya is active.
Logout clears the token. A visible Logout button lives in the admin header.

---

## Section 6 — Public Shop Display Flow

```
Visitor loads merch.html
       |
       v
JavaScript runs on page load (anon key — no auth required):
  supabase.from('shop_products')
    .select('*')
    .eq('is_hidden', false)
    .order('sort_order')
       |
       v
Products render as cards:
  - Photo (Supabase Storage CDN URL or repo relative path)
  - Name, description, price
  - Stock badge:
      quantity_available > 5  =>  "In Stock"
      quantity_available 1-5  =>  "Only [n] left!"
      quantity_available = 0  =>  "Sold Out" (no buy button shown)
      is_sold_out = true      =>  "Sold Out" (manual override)
  - "Get Yours" button => links to webador_link
       |
       v
User clicks "Get Yours" -> Webador handles cart, checkout, payment
```

This system NEVER touches payments. Webador is the only payment processor.

---

## Section 7 — What Needs Supabase

| Feature | Table or Bucket | Status |
|---|---|---|
| Handmade item registry | merch_items | Existing (in schema.sql) |
| Story submissions (QR-linked) | story_submissions | Existing |
| QR scan analytics | scan_log + functions | Existing |
| Shop inventory display | shop_products + view | New |
| Product photo storage | product-photos bucket | New |
| Event registrations | event_registrations | New |
| Memorial submissions | memorial_submissions | New |
| Memorial photo storage | memorial-photos bucket | New |

Total: 6 tables, 2 storage buckets, 1 Supabase project.
All within free tier limits (500MB DB, 1GB Storage, 50k monthly active users).

---

## Section 8 — What Needs Netlify

| Feature | How |
|---|---|
| Static site hosting | Connect GitHub repo, auto-deploy on push to main |
| Clean URLs (/admin vs /admin.html) | _redirects file (already written in Story System) |
| Admin authentication | Netlify Identity (invite-only, free up to 1,000 users) |
| HTTPS / SSL | Automatic, free |
| Custom domain | DNS A or CNAME record pointed to Netlify |
| CI/CD | Push to main → live in ~60 seconds |
| Sept. RSVP (simple option) | Netlify Forms: one HTML attribute, no database needed |

**Netlify Forms detail:** Submissions stored in Netlify dashboard and emailed automatically.
Free tier: 100 submissions/month. Ideal for the Sept. 12–13 event RSVP.

---

## Section 9 — What Can Stay Static

These pages need no database and should remain plain HTML:

  index.html, events.html (content only), resources.html, mental-health.html,
  everyone-fidgets.html, shoe-drive.html, three-rs.html, twizted-qr-codes.html,
  about.html, podcast.html, suicide-awareness.html, stories.html (display only),
  all CSS, all nav/footer, all existing hero images.

**What cannot stay static:**
- Shop product display with live inventory (needs Supabase)
- Story submission form (needs Supabase)
- Event registration with storage (needs Supabase or Netlify Forms)
- Memorial submission form (needs Supabase)
- Admin panel (needs Netlify Identity + Supabase)

---

## Section 10 — Risks and Simpler Alternatives

### Risk 1: Too Much Infrastructure at Once

**Risk:** Supabase + Netlify Identity + 3 new tables + 2 buckets + full admin panel
is a significant sprint. Rushing it before the Sept. event introduces failure points.

**Simpler alternative:** Use Netlify Forms for the Sept. RSVP. Add the `netlify` attribute
to the events.html form. Takes 15 minutes. Submissions email directly to Tonya and appear
in the Netlify dashboard. Migrate to Supabase event_registrations after the event.

**Verdict:** Netlify Forms for Sept. RSVP. Supabase event_registrations in Phase D.

---

### Risk 2: Admin Password Visible in Source

**Risk:** The current Story System stores `adminPassword` in config.js.
Anyone who views page source can access the admin panel.

**Short-term mitigation:** Change the password from `TJ2026admin` to something
strong before deploying. Record it privately (not in code).

**Upgrade path:** Netlify Identity replaces the password entirely during Phase C.

---

### Risk 3: Supabase Free Tier Behavior

**Risk:** Older Supabase free plans paused projects after 1 week of inactivity.
This policy has changed but confirm the current terms at account creation.

**Mitigation:** Weekly admin logins prevent any inactivity-based pause.
Check supabase.com/pricing when signing up.

---

### Risk 4: Product Photo Upload UX

**Risk:** Building drag-and-drop upload UI for Supabase Storage is non-trivial.
Rushing it produces a clunky experience.

**Phase 1 alternative:** Tonya places product photos in the GitHub repo at
public/assets/images/products/ using the GitHub web editor. Photo URLs are
relative paths. Zero custom upload UI needed initially.

Move to Supabase Storage uploads in Phase 2 once the admin panel is stable.

---

### Risk 5: Inventory Count Drift

**Risk:** Webador processes all orders. This system has no automatic connection
to Webador's order system. Counts will drift unless manually updated.

**Mitigation:** Admin panel shows a simple "Update Sold Count" input per product.
Tonya updates it after checking Webador sales (suggested cadence: every Monday).

**Future path:** If Webador ever adds webhooks or export, automate the sync then.

---

## Section 11 — Recommended Phase Plan

### Phase A — Now (No Accounts Needed)
- [x] Finalize this plan document
- [ ] Review with Tonya: confirm priorities and Phase B timing
- [ ] Decide: Netlify Forms for Sept. RSVP, or skip registration storage?
- [ ] Copy Section 3 SQL into a separate migration file, ready to paste

### Phase B — Account Setup Day (~45 minutes)
1. Create Netlify account → connect GitHub repo → deploy site
2. Enable Netlify Identity → set to invite-only → invite Tonya by email
3. Create Supabase project (or confirm existing Story System project reuse)
4. Run schema.sql (existing tables) in Supabase SQL editor
5. Run new tables SQL (Section 3 of this plan) in same SQL editor
6. Create product-photos bucket (public) and memorial-photos bucket (private)
7. Update config.js with project URL + anon key → git push → verify deploy
8. Test: admin login, form submission, Supabase table check
9. Coordinate DNS: point twiztedjourneys.org to Netlify
   DO NOT touch Webador payment/checkout subdomain DNS during this step

### Phase C — Admin Panel Build (~4–6 hours, after Phase B is stable)
1. Build /admin/index.html with tab navigation
2. Products tab: list, add, edit, hide, photo URL entry
3. Inventory tab: update sold/held counts, view computed quantity_available
4. Events tab: view by event name, filter by type, export to CSV
5. Memorials tab: pending queue, approve/reject, set featured flag
6. Stories + Items tabs: port existing admin.html UI from Story System
7. Push → Netlify auto-deploys → Tonya acceptance test

### Phase D — Public Pages Wire-Up (~2–3 hours, after Phase C passes)
1. Dynamic product display on merch.html (JS fetch from Supabase)
2. Event registration form on events.html (Netlify Forms or Supabase insert)
3. Memorial submission form on memorial.html (Supabase insert)
4. Memorial display section on memorial.html (Supabase select, approved only)
5. Update Twizted Treasures QR links to live Netlify story system URL
6. Full test on desktop + mobile

---

## Section 12 — Setup Steps (Once Accounts Are Approved)

Run these in order. Do not skip or reorder.

**Step 1:**
  netlify.com → Sign up with GitHub →
  Add new site → Import existing project →
  Choose tonyarcrump-del/twiztedjourneys →
  Branch: main → Deploy site

**Step 2:**
  Netlify site settings → Identity → Enable Identity →
  Registration preferences: Invite only → Save

**Step 3:**
  Netlify Identity → Invite users → enter Tonya's email → Send invite

**Step 4:**
  supabase.com → Sign up → New project →
  Name: "twizted-journeys" → Region: US East →
  Set database password (save it somewhere safe) → Create

**Step 5:**
  Supabase → SQL Editor → New query →
  Paste full contents of TJ_Story_System/schema.sql → Run
  Expected: "Success. No rows returned."

**Step 6:**
  Supabase → SQL Editor → New query →
  Paste new tables SQL from Section 3 of this plan → Run
  Expected: "Success. No rows returned."

**Step 7:**
  Supabase → Storage → New bucket:
    Name: product-photos   Public: YES
  Supabase → Storage → New bucket:
    Name: memorial-photos  Public: NO

**Step 8:**
  Supabase → Project Settings → API →
  Copy: Project URL (https://xxxxx.supabase.co)
  Copy: anon public key (long eyJ... string)

**Step 9:**
  Open TJ_Story_System/config.js →
  Fill in supabaseUrl and supabaseAnonKey with real values →
  Change adminPassword from TJ2026admin to something strong →
  git add config.js → git commit → git push
  Netlify auto-deploys in ~60 seconds

**Step 10 — Test everything:**
  Test 1: visit /admin → login with Tonya's credentials → dashboard loads
  Test 2: go to /story?item=TJ-HM-0001 → fill out form → submit →
          check Supabase table editor → story appears in story_submissions
  Test 3: check scan_log table → scan record appears

**Step 11 — DNS (coordinate carefully):**
  Add Netlify's DNS record to domain registrar
  DO NOT touch Webador checkout subdomain or payment DNS records
  GitHub Pages remains live during DNS propagation (up to 24 hours)
  Confirm twiztedjourneys.org → Netlify after propagation completes

**Step 12:**
  Search all HTML files for "tonyarcrump-del.github.io/twiztedjourneys" →
  Replace with "twiztedjourneys.org" →
  git commit -m "Update all internal links to live domain" → git push

---

## Key Constraints (Permanent)

- **Do NOT touch:** Webador payment settings, checkout, shipping, donation settings, private links
- **Donate link:** Always https://www.twiztedjourneys.org/donations-matter — never changes
- **Social links:** Only Facebook Community Group (/groups/560290368564902/) is confirmed.
  No other social platforms until Tonya confirms exact URLs.
- **Credentials:** Supabase anon key in config.js is safe to expose (RLS protects data).
  Service role key is NEVER in client-side code and NEVER committed to GitHub.
- **Payments:** This system never collects payment information. Webador handles all transactions.
- **Crisis line:** 988 remains visible on all public-facing pages.
- **Photos:** Tonya's original artwork is always primary — no AI-generated product images.

---

*Next action: Review this plan with Tonya. Confirm Phase A decisions before any accounts are created.*
*Questions: natewhittaker91@gmail.com*
