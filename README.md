# King Mobile + Laptop Experts — website

Marketing site for **King Mobile + Laptop Experts**, a buy-and-sell shop for
phones, tablets and laptops at 308 Rideau St, Unit A, Ottawa, ON K1N 5Y4 ·
(613) 206-6060.

The shop buys devices from the public for cash, sells tested pre-owned stock
with a warranty, and takes trade-ins. **It does not sell repairs**, and the
site carries no repair content.

Static HTML, CSS and vanilla JavaScript. No build step, no framework, no npm
install — the files you edit are the files that ship.

---

## ⚠️ Before you go live

The site is complete and deployable, but a few values are **placeholders**.
Work through this list first.

| # | What | Where | Why it matters |
|---|------|-------|----------------|
| 1 | **Payout figures** | The two tables in `sell.html` (`#payout`) | These are illustrative numbers, **not yours**. Publishing them unchanged means sellers arrive expecting a payout you never offered. Delete the section entirely if you'd rather quote only by phone. |
| 2 | **Opening hours** | Three places, see [Opening hours](#opening-hours) below | Wrong hours send people to a closed shop and hurt your Google ranking. |
| 3 | **Domain name** | Every `https://kingmobileexperts.ca` in all 7 pages, plus `robots.txt` and `sitemap.xml` | Canonical tags and social previews break on the wrong domain. |
| 4 | **Google Ads conversion labels** | `CONVERSIONS` in `assets/js/gtag.js` | The tag is live but records **nothing** until you paste the labels. See [Google Ads tracking](#google-ads-tracking). |
| 5 | **Google review links** | `index.html` and `laptops.html`, the two links in each `#reviews` section | Currently a Maps *search*; swap for your Business Profile's direct review URL. |
| 6 | **Map coordinates** | `geo` block in `index.html` JSON-LD, `geo.position` in `contact.html` | Approximate (45.4287, −75.6857). Verify against your real pin. |
| 7 | **Shop promises** | "90-day warranty", "40-point check", "wiped in front of you" | These appear across the site, `/laptops` included, as commitments. Keep only what you actually offer. |

### Quick find-and-replace

```bash
# 3. Swap the domain everywhere (use your real one)
grep -rl 'kingmobileexperts.ca' . --include='*.html' --include='*.txt' --include='*.xml' \
  | xargs sed -i 's|kinglyottawa\.com|yourdomain.ca|g'

# Confirm nothing was missed
grep -rn 'kingmobileexperts.ca' . --include='*.html' --include='*.txt' --include='*.xml'
```

---

## Opening hours

Hours live in **three** places and must agree. If they disagree, Google trusts
the structured data and your visitors trust the table — so they'll conflict.

1. **`assets/js/main.js`** → the `HOURS` object at the top. Drives the live
   "Open now / Closed" badge and today's-row highlight. Times are 24-hour
   `"HH:MM"` in Ottawa local time; use `null` for a day you're closed.
2. **The visible tables** → `<table class="hours">` in `index.html`,
   `laptops.html`, `contact.html`, and the footer of every page.
3. **The structured data** → `openingHoursSpecification` in the JSON-LD block
   in `index.html`.

The badge is always computed in `America/Toronto`, so a visitor in Vancouver
still sees whether *the shop* is open, not whether it's open in their timezone.

---

## Deploying to Vercel

The repo is Vercel-ready — `vercel.json` handles routing, caching and security
headers. Nothing to build.

### Option A — connect the Git repo (recommended)

1. Go to [vercel.com/new](https://vercel.com/new) and import this repository.
2. Framework preset: **Other**. Build command: **leave empty**.
   Output directory: **leave empty** (the repo root *is* the site).
3. Deploy. Every push to the default branch redeploys automatically, and every
   pull request gets its own preview URL.

### Option B — from your machine

```bash
npm i -g vercel
vercel          # preview deploy
vercel --prod   # production
```

### Adding your domain

In the Vercel project: **Settings → Domains → Add**, then point your registrar
at the records Vercel shows you. Afterwards, run the find-and-replace in
[Before you go live](#️-before-you-go-live) so canonical URLs match the live domain.

### What `vercel.json` does

- **`cleanUrls: true`** — serves `/services` instead of `/services.html`, and
  301-redirects the `.html` form. This is why every internal link is
  extensionless; don't add `.html` back to them.
- **Caching** — assets are cached for a day in the browser and a year at
  Vercel's edge. Vercel purges the edge on each deploy, so updates go live
  immediately. If you change a file and want to bust *browser* caches right
  away, bump a version query in the `<link>`/`<script>` tags
  (`styles.css?v=2`).
- **Security headers** — `nosniff`, `Referrer-Policy`, `X-Frame-Options`,
  `Permissions-Policy`, HSTS and a Content-Security-Policy.

> **Adding a third-party script later?** (Google Analytics, a chat widget, a
> booking embed.) The CSP in `vercel.json` will block it until you add its
> domain to the relevant directive — `script-src` for scripts, `connect-src`
> for the data it sends, `frame-src` for iframes. If something silently fails
> to load after you add it, open the browser console; a CSP violation says
> exactly which directive to extend.

---

## Local preview

Because links are extensionless, open the site through a server rather than
double-clicking the files:

```bash
npx serve .        # http://localhost:3000
# or
vercel dev         # matches production routing exactly
# or
python3 -m http.server 8000   # note: use /services.html paths with this one
```

---

## Structure

```
├── index.html          Home — buy, sell & trade
├── sell.html           Sell to us: what we buy, payouts, trade-in (/sell)
├── buy.html            Buy from us: stock, 40-point check, warranty (/buy)
├── laptops.html        Laptops: sell, buy & trade, laid out like home (/laptops)
├── contact.html        Contact, hours, directions (/contact)
├── privacy.html        Privacy & cookies notice     (/privacy)
├── 404.html            Not-found page (Vercel serves this automatically)
├── vercel.json         Routing, caching, security headers
├── robots.txt          Crawler rules + sitemap pointer
├── sitemap.xml         The six indexable URLs
├── site.webmanifest    Add-to-home-screen metadata
├── favicon.ico/.svg    Browser tab icons
└── assets/
    ├── css/styles.css  Whole design system, one file, numbered sections
    ├── js/main.js      Nav, open/closed badge, reveals, call bar, forms
    └── img/            Crown logo, app icons, social share card
```

Header and footer markup is duplicated across every page (the cost of
having no build step). **If you change the nav or footer, change it in all
seven** — `index.html`, `sell.html`, `buy.html`, `laptops.html`,
`contact.html`, `privacy.html`, `404.html`.

---

## How it's built for mobile

Most visitors arrive on a phone, often a damaged one, on mobile data. So:

- **Sticky call bar** pinned to the bottom of every page under 992px — the
  highest-converting element on a local shop's site.
- **Click-to-call everywhere.** Every phone number is a `tel:` link, and they
  all point at the same number so Google reads one consistent NAP.
- **One conversion path — the phone.** No forms to fill on a device that may
  barely work; every CTA dials.
- **48px minimum touch targets** under `@media (pointer: coarse)`.
- **No horizontal overflow** at any width — verified with a headless browser at
  390px and 1440px.
- **Safe-area insets** honoured so nothing hides under a notch or home bar.
- **~45 KB of CSS + JS total**, no framework, no jQuery, no layout shift.

---

## There is no contact form — by design

Every call to action on this site is a phone call. There are no enquiry forms,
so there's no inbox to watch, no spam to wade through, and no customer left
wondering whether their message arrived.

That suits this business: someone with a cracked screen wants a price now, and
a two-minute call closes the job that an email thread wouldn't. It also means
one fewer thing to configure, and one fewer third party handling your
customers' details.

The call-to-action surfaces are:

- The **call card** in the hero on the home page, and the matching panel on
  `/contact` — both lead with the number at display size.
- The **sticky call bar** on every page below 992px.
- The header button, and a call CTA closing every major section.
- Every phone number on the site is a `tel:` link, so one tap dials.

**If you ever do want a form back**, add it to the call card in `index.html`
and `contact.html`, restore the `.field` / `.form-status` styles (see git
history for `assets/css/styles.css`), and extend the CSP in `vercel.json` —
`form-action` is currently `'none'` and `connect-src` is `'self'`, so a form
posting to a third party will be blocked until you allow its domain.

## Google Ads tracking

The Google tag for **AW-17829939467** is installed in the `<head>` of every
page. The dataLayer bootstrap and config live in `assets/js/gtag.js` rather
than inline, so the Content-Security-Policy can stay at `script-src 'self'`
with no `'unsafe-inline'` and no CSP hash to keep in sync.

### ⚠️ It records nothing until you add conversion labels

The tag loads and fires, but a conversion only reaches Google Ads once you
paste the matching label. In Google Ads: **Goals → Conversions → New
conversion action → Website**. Create one for phone calls and (optionally)
one for directions, then copy each action's `send_to` value — it looks like
`AW-17829939467/AbCdEfGhIjKlMnOpQrS` — into `CONVERSIONS` at the top of
`assets/js/gtag.js`.

Until you do, every click is still pushed to the dataLayer (so it shows up in
Tag Assistant) and the browser console warns you the label is missing, but
Google Ads receives nothing.

### What gets tracked

| Action | When it fires |
|---|---|
| `call` | Any `tel:` link is tapped — header, hero card, sticky bar, CTAs. Tagged with whether it came from the sticky bar or the page body. This is the valuation enquiry, so it's the conversion that matters. |
| `directions` | Any Google Maps directions link is clicked. |

### Enhanced conversions — on, but with nothing to feed it

`allow_enhanced_conversions: true` is set, and the hashing hook is built and
tested. **But enhanced conversions works by hashing first-party customer data
— email, phone, name, address — and this site deliberately has no forms, so
there is currently no such data to send.** The feature is wired and dormant.

It starts paying off the moment you add somewhere a customer types their
details (a valuation form, a reservation request, an email capture). At that
point, call this before the conversion fires:

```js
kingTrack.setUserData({
  email: "customer@example.com",
  phone: "613 555 0123",
  firstName: "Alex", lastName: "Chen",
  city: "Ottawa", region: "ON", postalCode: "K1N 5Y4"
});
```

Values are normalised (lowercased, phone to E.164, postal code stripped) and
SHA-256 hashed **in the visitor's browser** by gtag — the raw details never
leave the device. Only pass details a customer gave you for this purpose.

### Call reporting — the one that actually suits this business

Since the conversion here is a phone call, the higher-value Google Ads feature
is **"Calls from a website"**: Google swaps the number on the site for a free
forwarding number and attributes calls to ads automatically — no customer data
needed. It's built in but **off by default**, because it changes the number
visitors see. To turn it on, set up the conversion action in Google Ads, then
in `assets/js/gtag.js` set `CALL_REPORTING.ENABLED = true` and paste its label.

### If conversions stop showing up, check the CSP first

The `Content-Security-Policy` in `vercel.json` is the most likely culprit — a
blocked request fails silently in production. Open the browser console on the
live site and look for CSP violation messages; they name the exact directive
to extend. The policy currently allows `googletagmanager.com` to serve scripts
and Google/DoubleClick domains to receive pixels and beacons.

Adding another third-party tag later (GA4, Meta pixel, a chat widget) means
adding its domain to `script-src`, and wherever it sends data to `connect-src`
and `img-src`.

### Consent mode (EEA/UK) — not implemented

Google's setup screen suggests consent mode. It is **not** implemented here,
deliberately: consent mode without a consent banner to drive it either changes
nothing or silently breaks your tracking. Your customers walk into a shop on
Rideau Street, so EEA traffic is effectively nil.

If you ever advertise into the EEA or UK, you'd need a consent banner plus a
`gtag('consent', 'default', {...})` call ahead of the config in
`assets/js/gtag.js`. Quebec's Law 25 is worth a look too, given Gatineau is
across the river.

### Privacy page

`/privacy` documents the tag, the cookies and the enhanced-conversions
hashing, and is linked from every footer. **Google's Enhanced Conversions
terms require you to disclose that you share data with Google and to have the
right consents**, so don't delete that section while the feature is on.

That page accurately describes what this website's code does. It deliberately
says nothing about how you handle purchase records, ID scans or customer details
*in the shop* — only you know that. Add a section covering it, and have the
page reviewed by someone qualified before relying on it. It is a starting
point, not legal advice.

## SEO notes

Already in place:

- `LocalBusiness` (`MobilePhoneStore`) structured data with address, phone,
  geo, hours, service catalogue and area served.
- `FAQPage` structured data on the home page and `/laptops`, each mirroring
  its visible FAQ word-for-word (Google requires the match). Keep the two
  sets of questions different: Google wants each question marked up only
  once per site.
- `BreadcrumbList` on every interior page, canonical URLs, Open Graph and
  Twitter cards, `sitemap.xml` and `robots.txt`.

**No `aggregateRating` is included, deliberately.** Inventing a star rating is
a manual-action risk with Google and, in Canada, a deceptive-marketing problem
under the Competition Act. Ratings should come from your real Google Business
Profile. For the same reason there are **no hard-coded testimonials** — the
reviews section links to your real Google reviews, and `index.html` contains a
commented-out template if you want to feature genuine quotes later.

The two pages are split deliberately: someone searching *"sell my iPhone
Ottawa"* and someone searching *"used phones Ottawa"* want completely
different things, so they get separate pages, titles and descriptions rather
than one page trying to rank for both.

`/laptops` does the same job for laptop searches (*"sell my MacBook Ottawa"*,
*"used laptops Ottawa"*). It follows the home page's layout with laptop-only
copy, and `/laptop` 301-redirects to it in `vercel.json`.

Old repair URLs (`/services`, `/buy-sell`) 301-redirect to `/sell` in
`vercel.json`, so anything already pointing at them doesn't dead-end.

Biggest remaining win: claim and complete your **Google Business Profile**, and
make sure the name, address and phone match this site character-for-character.
For a shop like this, that profile drives more calls than the website will.

---

## Accessibility

Skip link, landmark elements, `aria-current` on the
active nav item, `aria-expanded` on the menu toggle, visible focus rings,
keyboard-operable everything, and `prefers-reduced-motion` respected.

Contrast is checked with a script that walks every text node on every page,
resolves the real painted backdrop (including gradients and alpha tints) and
compares against WCAG AA. All visible text passes.

Two rules keep it that way, both in `assets/css/styles.css`:

- `--red` (`#e02424`) is the fill behind white text — buttons, the top bar,
  the CTA band. It clears AA at 4.72:1. A pure `#ec2424` lands at 4.33:1 and
  fails, so don't lighten this token.
- `--red-text` (`#c51b1b`) is for red *text* and small icons on white
  (5.1:1). `--red` itself only reaches 4.1:1 as small copy, so don't use it
  for body text.

## Look and feel

The site is deliberately a white-and-red retail storefront, in the register
of a modern Canadian phone shop: white page, one signal red carrying every
call to action, near-black text, two soft greys for section banding, pill
buttons, circular icon chips and a charcoal footer. There are no dark "tech"
panels — contrast comes from red on white.

Everything is driven by the tokens in section 1 of `assets/css/styles.css`.
Two class names are historical and no longer describe what they do:
`.section--ink` is now the darker of the two light greys, and `.btn--red`
is simply the primary button. They are kept because they appear across every
page.
