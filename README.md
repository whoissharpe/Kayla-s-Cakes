# Kayla's Cakes — website

Marketing site and order-intake system for **Kayla's Cakes**, a Florida cottage
food bakery in Jacksonville run by Kayla Duke. Replaces the Linktree as the
place customers are sent to book.

- **Framework:** [Astro](https://astro.build) (static output) + TypeScript + Tailwind v4
- **Backend:** Cloudflare Pages Functions + D1 (leads) + R2 (photo uploads)
- **Email:** [Resend](https://resend.com)
- **Hosting:** Cloudflare Pages

---

## Running it locally

```bash
npm install
npm run dev          # http://localhost:4321
```

That gives you the marketing pages. The order form and `/admin` need the
backend, which means running through Wrangler instead:

```bash
npm run build
npx wrangler pages dev dist --d1 DB --r2 PHOTOS
```

Create a `.dev.vars` file (copy `.env.example`) for local secrets. It is
gitignored and must stay that way.

### Useful commands

| Command | What it does |
|---|---|
| `npm run dev` | Astro dev server, front end only |
| `npm run build` | Production build into `dist/` |
| `npm run check` | Typecheck the Astro site |
| `npm run check:functions` | Typecheck the Pages Functions |
| `npm run db:local` | Apply `db/schema.sql` to the local D1 database |
| `npm run db:remote` | Apply `db/schema.sql` to the production D1 database |

---

## Adding gallery photos

Two steps, no components to touch.

1. Drop the image files into `public/gallery/`.
2. Add an entry to `src/data/gallery.json`:

```json
{ "src": "/gallery/birthday-cake.webp", "alt": "Two-tier birthday cake with gold drip", "width": 1200, "height": 1500 }
```

Notes:
- **`alt` is required.** It's what a blind visitor hears, and it's how the
  photo shows up in search. Describe the cake in a short phrase.
- `width` and `height` are the real pixel dimensions. They reserve the right
  space while the image loads so the page doesn't jump around.
- Remove `"placeholder": true` from any entry once a real photo replaces it —
  that flag is what draws the "Placeholder" badge.
- WebP or AVIF, ideally under 300 KB each. Long edge around 1600px is plenty.

---

## Editing the copy

| What | Where |
|---|---|
| Phone, email, service area, social links, legal disclosure | `src/data/site.ts` |
| The six "What she makes" cards | `src/data/categories.ts` |
| Hero headline and intro line | `src/components/Hero.astro` |
| The three ordering steps | `src/components/HowItWorks.astro` |
| Kayla's bio | `src/components/About.astro` |
| Order form fields | `src/components/OrderForm.astro` |

---

## Deploying

Pushes to `main` deploy automatically once the Pages project is connected.
Pull requests get their own preview URL.

### First-time Cloudflare setup

These steps need a Cloudflare account and **have not been done yet** — nobody
in this repo has had access to your Cloudflare account.

1. **Create the Pages project.** Cloudflare Dashboard → Workers & Pages →
   Create → Pages → connect this GitHub repo.
   - Build command: `npm run build`
   - Output directory: `dist`

2. **Create the database and bucket:**
   ```bash
   npx wrangler d1 create kaylas-cakes-leads
   npx wrangler r2 bucket create kaylas-cakes-photos
   ```

3. **Bind them** in Pages → Settings → Functions → Bindings:
   - D1 binding named `DB` → `kaylas-cakes-leads`
   - R2 binding named `PHOTOS` → `kaylas-cakes-photos`

   Keep the R2 bucket **private**. Photos are only ever served through
   `/api/admin/photo/*`, which requires an admin session.

4. **Apply the schema:** `npm run db:remote`

5. **Set the secrets** (Pages → Settings → Environment variables, all
   encrypted). See `.env.example` for the full list:

   | Name | Notes |
   |---|---|
   | `RESEND_API_KEY` | From resend.com |
   | `NOTIFY_EMAIL` | Where new-lead emails go |
   | `FROM_EMAIL` | A verified sender on your Resend domain |
   | `ADMIN_PASSWORD_HASH` | SHA-256 of the `/admin` password — see below |
   | `SESSION_SECRET` | `openssl rand -hex 32` |

6. **Point the form at production.** Set `orderEndpoint` in `src/data/site.ts`
   to `''` once the API is on the same domain as the site (same-origin is the
   intended setup, and an empty string makes the form post to `/api/order`).

### Setting the admin password

Never commit the password. Only its hash is stored, and only in Cloudflare.

```bash
echo -n 'BakedWithLove904' | shasum -a 256
```

Paste the resulting hex string as `ADMIN_PASSWORD_HASH`. `BakedWithLove904`
is a suggestion — swap in whatever Kayla will actually remember, then re-run
the command.

### Custom domain (manual step)

Once Kayla picks a domain, add it in Pages → Custom domains, then create
these DNS records at the registrar:

| Type | Name | Value | Proxy |
|---|---|---|---|
| `CNAME` | `@` (or `kaylascakes.com`) | `<project>.pages.dev` | Proxied |
| `CNAME` | `www` | `<project>.pages.dev` | Proxied |

If the registrar rejects a CNAME at the apex, move the domain's nameservers
to Cloudflare and let Cloudflare flatten it. Resend will also want its own
DKIM/SPF records — it prints the exact values when you verify the domain.

---

## Before launch

Things that must be confirmed or replaced. **Nothing here is invented data —
where a fact wasn't available it's marked and left for Kayla to confirm.**

### Must confirm with Kayla

- [ ] **Phone number.** `(904) 309-2270` came from a web search, *not* from
      Kayla. Verify before it goes live.
- [ ] **Email address.** `kaylascakesbakedwithlove@gmail.com` — same caveat.
- [ ] **Service area and delivery radius.** Currently the vague
      "Jacksonville, FL and surrounding areas."
- [ ] **Cottage food disclosure wording.** The footer carries the statement
      Florida requires on cottage food *labels*
      (Fla. Stat. § 500.80). Putting it on the site is a good-faith
      transparency choice, not a documented legal requirement, and it does not
      replace the label on her packaging. Worth a second opinion.
- [ ] **Facebook link.** One search result suggested her original page was
      disabled and she was rebuilding. Confirm the URL still resolves.
- [ ] **Bio in `About.astro`.** Written in her voice as a first draft. She
      should rewrite it to be actually true.

### Must replace

- [ ] **`public/brand/logo-lockup.png` and `logo-mark.png`.** The generated
      logo files need to be downloaded from Higgsfield and dropped in. The
      site references these paths and will show broken images until then.
- [ ] **Category card images** (`public/brand/categories/*`). Generated
      placeholders. Replace with Kayla's real photos.
- [ ] **Gallery photos** (`public/gallery/*`). All six are placeholders and
      carry a visible "Placeholder" badge.
- [ ] **`public/brand/og.png`.** Generated placeholder social share image.

### Generated brand assets (intentional, not placeholders)

- `public/brand/hero-cake.webp` and `hero-cake-spin.mp4` — the spinning
  turntable hero. Generated imagery, kept deliberately as a brand image. It
  is not a photograph of Kayla's work.
- `public/brand/favicon.svg` — derived from the logo mark.

### Technical

- [ ] Run Lighthouse on the deployed URL, mobile profile.
- [ ] Check the hero video loop in Safari specifically.
- [ ] Send a real test order and confirm the email lands.

---

## Accessibility notes

Contrast was measured, not eyeballed. Two results changed the palette:

- **`mint-600` (#3FA697) fails WCAG AA as text or as a button background** —
  2.86:1 on cream, 2.95:1 behind white text. Buttons and links use
  **`mint-800` (#22685D)** instead (6.34:1 and 6.55:1). `mint-600` is only
  used for borders, icon strokes and hover fills.
- **`gold-500` (#C9A24B) fails on cream (2.32:1)** and on mint-800 (2.73:1).
  It passes only on `ink` (7.68:1), so gold is restricted to thin rules, small
  marks, and text on dark backgrounds.

Also in place: skip link, visible focus rings, semantic landmarks, labelled
form fields with associated errors, a keyboard-navigable lightbox, and a full
static fallback under `prefers-reduced-motion`.

---

## Security notes

- No secrets in the repo. `.env.example` documents the names only.
- The admin password is stored as a SHA-256 hash in a Cloudflare secret and
  compared in constant time, with a delay on failure.
- Session cookies are HMAC-signed, `HttpOnly`, `Secure`, `SameSite=Strict`.
- The R2 bucket is private; photos are only reachable through an authenticated
  endpoint that refuses any key outside `leads/`.
- `/admin` is `noindex` and disallowed in `robots.txt`.

A single shared password suits one person managing her own leads. If more
people ever need access, this should become real per-user accounts.
