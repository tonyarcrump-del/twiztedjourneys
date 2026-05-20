# Admin Panel Setup Guide
## Twizted Journeys — Tonya's Admin Access

**This guide takes about 30–45 minutes total. Nate walks through this once the domain and Netlify are ready.**

---

## Step 1 — Deploy to Netlify (Nate)

1. Go to https://app.netlify.com → "Add new site" → "Import from Git"
2. Connect GitHub → select `tonyarcrump-del/twiztedjourneys`
3. Build settings:
   - Build command: *(leave blank)*
   - Publish directory: `.` (just a dot — the repo root)
4. Click **Deploy site**
5. Note the generated URL (e.g., `twiztedjourneys.netlify.app`)

---

## Step 2 — Enable Netlify Identity (Nate)

In the Netlify dashboard for the site:

1. **Site Settings → Identity → Enable Identity**
2. Under "Registration preferences" → **Invite only** (IMPORTANT)
3. Under "External providers" — leave unconfigured for now
4. Under "Emails" → turn on "Confirmation template" and "Recovery template"

---

## Step 3 — Invite Tonya (Nate)

1. Identity tab → **Invite users**
2. Enter: `tonyarcrump@gmail.com`
3. She receives an email — she clicks the link, sets a password
4. She can now log in at `https://twiztedjourneys.org/admin`

---

## Step 4 — Connect Supabase (Nate)

### 4a. Create Supabase project

1. Go to https://supabase.com → New project
2. Name: `twizted-journeys`
3. Database password: *(save this securely — Nate only)*
4. Region: US East (Ohio) or US Central

### 4b. Run the schema

1. Supabase dashboard → **SQL Editor**
2. First paste and run: `C:\Twisted Journeys\TJ_Story_System\schema.sql` (existing 3 tables)
3. Then paste and run: `admin/schema.sql` (new 3 tables + RLS policies)
4. Verify tables exist: merch_items, story_submissions, scan_log, shop_products, event_registrations, memorial_submissions

### 4c. Get API credentials

1. Supabase → Project Settings → API
2. Copy **Project URL** → `supabaseUrl`
3. Copy **anon public** key → `supabaseAnonKey`
4. **NEVER use the service_role key in client code**

### 4d. Update config.js

Edit `admin/config.js`:
```js
supabaseUrl:     'https://XXXX.supabase.co',
supabaseAnonKey: 'eyJhbGc...',
siteUrl:         'https://www.twiztedjourneys.org',
```

Commit and push → Netlify auto-redeploys.

---

## Step 5 — Configure Form Notifications (Nate)

In Netlify dashboard:

1. Go to **Forms** (it auto-discovers forms on first deploy)
2. For each form (event-rsvp, memorial-submission, story-submission):
   - Click the form → Settings → Email notifications
   - Add: `tonyarcrump@gmail.com`

Tonya will now get an email every time someone submits a form.

---

## Step 6 — Domain Transfer (After Tonya Approves) 

**Do not touch DNS until Tonya gives final approval.**

When ready:
1. Add custom domain in Netlify: Site Settings → Domain Management → Add custom domain
2. Enter `twiztedjourneys.org`
3. Netlify shows the DNS records needed
4. In the registrar: point nameservers to Netlify's nameservers
5. Netlify auto-provisions an SSL certificate (Let's Encrypt)
6. Allow 24–48 hours for full propagation

---

## Admin Panel URL (after domain transfer)

```
https://www.twiztedjourneys.org/admin
```

Tonya logs in with her email + the password she set in Step 3.

---

## What Tonya Can Do in the Admin Panel

| Panel | What She Can Do |
|-------|----------------|
| Dashboard | See counts at a glance — pending submissions, RSVPs, products |
| Submissions | Review memorial and story submissions — approve or reject |
| Event RSVPs | See all RSVP registrations, filter by type/day, export CSV |
| Shop Inventory | Add products, hide/show listings, update quantities |

## What Tonya Cannot Do (by design)

- Touch Webador, payments, checkout, or donations *(handled by Webador, separate system)*
- See or modify the Supabase service role key *(Nate only)*
- Create other admin accounts *(Nate sends invites from Netlify dashboard)*

---

*Setup questions: natewhittaker91@gmail.com*
