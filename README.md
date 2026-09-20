# Kingly Ottawa — website

Marketing site for **Kingly Ottawa**, a phone, tablet and laptop repair shop at
308 Rideau St, Unit A, Ottawa, ON K1N 5Y4 · (613) 206-6060.

Static HTML, CSS and vanilla JavaScript. No build step, no framework, no npm
install — the files you edit are the files that ship.

---

## ⚠️ Before you go live

The site is complete and deployable, but a few values are **placeholders**.
Work through this list first.

| # | What | Where | Why it matters |
|---|------|-------|----------------|
| 1 | **Repair prices** | `services.html` (all `$` figures) and the `card-price` spans in `index.html` | These are illustrative numbers, **not yours**. Publishing them unchanged means customers arrive expecting a price you never set. |
| 2 | **Opening hours** | Three places, see [Opening hours](#opening-hours) below | Wrong hours send people to a closed shop and hurt your Google ranking. |
| 3 | **Domain name** | Every `https://kinglyottawa.com` in all 5 pages, plus `robots.txt` and `sitemap.xml` | Canonical tags and social previews break on the wrong domain. |
| 4 | **Contact form endpoint** | `YOUR_FORM_ID` in `index.html` and `contact.html` | Until set, the form tells visitors to phone instead of silently losing their message. |
| 5 | **Google review links** | `index.html`, the two links in the `#reviews` section | Currently a Maps *search*; swap for your Business Profile's direct review URL. |
| 6 | **Map coordinates** | `geo` block in `index.html` JSON-LD, `geo.position` in `contact.html` | Approximate (45.4287, −75.6857). Verify against your real pin. |
| 7 | **Warranty claims** | "90 days", "no fix no fee", "we beat written quotes" | These appear across the site as commitments. Keep only what you actually offer. |

### Quick find-and-replace

```bash
# 3. Swap the domain everywhere (use your real one)
grep -rl 'kinglyottawa.com' . --include='*.html' --include='*.txt' --include='*.xml' \
  | xargs sed -i 's|kinglyottawa\.com|yourdomain.ca|g'

# Confirm nothing was missed
grep -rn 'kinglyottawa.com\|YOUR_FORM_ID' . --include='*.html' --include='*.txt' --include='*.xml'
```

---

## Opening hours

Hours live in **three** places and must agree. If they disagree, Google trusts
the structured data and your visitors trust the table — so they'll conflict.

1. **`assets/js/main.js`** → the `HOURS` object at the top. Drives the live
   "Open now / Closed" badge and today's-row highlight. Times are 24-hour
   `"HH:MM"` in Ottawa local time; use `null` for a day you're closed.
2. **The visible tables** → `<table class="hours">` in `index.html`,
   `contact.html`, and the footer of every page.
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
├── index.html          Home
├── services.html       Repairs + full price list  (/services)
├── buy-sell.html       Buy, sell & trade          (/buy-sell)
├── contact.html        Contact, hours, directions (/contact)
├── 404.html            Not-found page (Vercel serves this automatically)
├── vercel.json         Routing, caching, security headers
├── robots.txt          Crawler rules + sitemap pointer
├── sitemap.xml         The four indexable URLs
├── site.webmanifest    Add-to-home-screen metadata
├── favicon.ico/.svg    Browser tab icons
└── assets/
    ├── css/styles.css  Whole design system, one file, numbered sections
    ├── js/main.js      Nav, open/closed badge, reveals, call bar, forms
    └── img/            Crown logo, app icons, social share card
```

Header and footer markup is duplicated across the five pages (the cost of
having no build step). **If you change the nav or footer, change it in all
five** — `index.html`, `services.html`, `buy-sell.html`, `contact.html`,
`404.html`.

---

## How it's built for mobile

Most visitors arrive on a phone, often a damaged one, on mobile data. So:

- **Sticky call bar** pinned to the bottom of every page under 992px — the
  highest-converting element on a local-services site.
- **Click-to-call everywhere.** Every phone number is a `tel:` link, and they
  all point at the same number so Google reads one consistent NAP.
- **16px form inputs** on touch widths, because iOS Safari auto-zooms anything
  smaller the moment it's focused and shoves the layout sideways.
- **48px minimum touch targets** under `@media (pointer: coarse)`.
- **No horizontal overflow** at any width — verified with a headless browser at
  390px and 1440px.
- **Safe-area insets** honoured so nothing hides under a notch or home bar.
- **~35 KB of CSS + JS total**, no framework, no jQuery, no layout shift.

---

## Contact form

Both forms post to [Formspree](https://formspree.io) (free tier is fine for a
shop this size). Create a form, then replace `YOUR_FORM_ID` in `index.html`
and `contact.html` with your real endpoint.

Until you do, the form deliberately **refuses to pretend it sent** — it shows
an error pointing at the phone number instead of silently dropping enquiries.

Prefer something else? Any endpoint that accepts a `POST` of form data and
returns 2xx works — Netlify Forms, Basin, Web3Forms, your own handler. Just
swap the `action` attribute.

---

## SEO notes

Already in place:

- `LocalBusiness` (`MobilePhoneStore`) structured data with address, phone,
  geo, hours, service catalogue and area served.
- `FAQPage` structured data mirroring the visible FAQ word-for-word (Google
  requires the match).
- `BreadcrumbList` on every interior page, canonical URLs, Open Graph and
  Twitter cards, `sitemap.xml` and `robots.txt`.

**No `aggregateRating` is included, deliberately.** Inventing a star rating is
a manual-action risk with Google and, in Canada, a deceptive-marketing problem
under the Competition Act. Ratings should come from your real Google Business
Profile. For the same reason there are **no hard-coded testimonials** — the
reviews section links to your real Google reviews, and `index.html` contains a
commented-out template if you want to feature genuine quotes later.

Biggest remaining win: claim and complete your **Google Business Profile**, and
make sure the name, address and phone match this site character-for-character.
For a shop like this, that profile drives more calls than the website will.

---

## Accessibility

Skip link, landmark elements, labelled form fields, `aria-current` on the
active nav item, `aria-expanded` on the menu toggle, visible focus rings,
keyboard-operable everything, `prefers-reduced-motion` respected, and text that
meets WCAG AA contrast on both the light and dark sections.
