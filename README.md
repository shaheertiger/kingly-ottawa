# King Mobile + Laptop Experts — website

Marketing site for **King Mobile + Laptop Experts**, a phone, tablet and laptop repair shop at
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
| 3 | **Domain name** | Every `https://kingmobileexperts.ca` in all 5 pages, plus `robots.txt` and `sitemap.xml` | Canonical tags and social previews break on the wrong domain. |
| 4 | **Google review links** | `index.html`, the two links in the `#reviews` section | Currently a Maps *search*; swap for your Business Profile's direct review URL. |
| 5 | **Map coordinates** | `geo` block in `index.html` JSON-LD, `geo.position` in `contact.html` | Approximate (45.4287, −75.6857). Verify against your real pin. |
| 6 | **Warranty claims** | "90 days", "no fix no fee", "we beat written quotes" | These appear across the site as commitments. Keep only what you actually offer. |

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

Skip link, landmark elements, `aria-current` on the
active nav item, `aria-expanded` on the menu toggle, visible focus rings,
keyboard-operable everything, `prefers-reduced-motion` respected, and text that
meets WCAG AA contrast on both the light and dark sections.
