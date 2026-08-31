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
# 1. Local secrets (gitignored — keep it that way)
printf 'ADMIN_PASSWORD_HASH=%s\nSESSION_SECRET=%s\n' \
  "$(printf '%s' 'BakedWithLove904' | sha256sum | cut -d' ' -f1)" \
  "$(openssl rand -hex 32)" > .dev.vars

# 2. Build, create the local tables, run it
npm run build
npm run db:local
npx wrangler pages dev
```

Then open http://localhost:8788 and sign in at `/admin` with
`BakedWithLove904`. Bindings come from `wrangler.toml`, and the local D1 and
R2 are simulated on disk — no Cloudflare account needed to develop against
the real code paths.

This flow has been run end to end: order submission with a photo upload,
past-date and bad-contact rejection, the honeypot, per-IP rate limiting,
admin login, status and note updates, gated photo access, and CSV export all
behave as described.

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

## Getting Kayla's photos

Her Instagram photos are hers to use, but scraping Instagram is against
their Terms of Use, so don't. The supported route is Instagram's own export:

**Instagram app → Settings → Accounts Centre → Your information and
permissions → Download your information.** Pick her account, choose Photos,
and request it. It arrives as a zip of every image at original quality,
usually within a few hours.

Unzip, pick the good ones, and follow the steps below.

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

### Cloudflare — already provisioned

The site is live at **https://kaylas-cakes.pages.dev**.

| Resource | Name |
|---|---|
| Pages project | `kaylas-cakes` |
| D1 database | `kaylas-cakes-leads` |
| R2 bucket | `kaylas-cakes-photos` (private) |
| Secrets set | `ADMIN_PASSWORD_HASH`, `SESSION_SECRET` |

The schema is applied and the whole flow is verified against production: an
order submits, the photo lands in R2, `/admin` signs in, the photo is served
only with a session, and a key outside `leads/` is refused.

**`wrangler.toml` is the source of truth for bindings.** `wrangler pages
deploy` syncs the Pages project config from it, so a binding added in the
dashboard or via the API is silently removed on the next deploy if it is not
also in this file. Secrets are the exception — they are managed separately and
a deploy does not touch them.

### Deploying a change

**Auto-deploy is connected.** Pushing to `claude/kaylascakes-website-snt0pi`
builds and deploys to production automatically; every other branch and PR gets
its own preview URL.

Cloudflare runs `npm run build` and publishes `dist`. `.node-version` pins the
build image to Node 22 — Astro 5, Vite 8 and wrangler 4 all refuse to run on
Node 20.

> **After the PR merges, move production to `main`.** The production branch is
> currently the feature branch, because `main` has no site on it yet and
> pointing production there would deploy an empty repo. Once merged:
> Workers & Pages → `kaylas-cakes` → Settings → Builds & deployments →
> Production branch → `main`.

To deploy by hand (rarely needed now):

```bash
npm run build
npx wrangler pages deploy dist --project-name=kaylas-cakes
```

Note the project is Git-connected, and a Git-connected project cannot be
converted back to direct upload — or vice versa. Changing that means deleting
and recreating the project, which is what was done here to attach the repo,
so the bindings and secrets had to be re-applied afterwards.

### Changing the admin password

```bash
echo -n 'your-new-password' | shasum -a 256
```

Paste the hash into Workers & Pages → `kaylas-cakes` → Settings → Environment
variables → `ADMIN_PASSWORD_HASH` (encrypted), then redeploy.

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

- [ ] **Category card photos.** The cards currently render a numbered
      watercolour panel instead of a photo — deliberately, because a
      generated cake photo reads as fake and undersells real work. To add a
      real one, drop the file in `public/brand/categories/` and set `image`
      on that category in `src/data/categories.ts`. The panel disappears on
      its own.
- [ ] **Gallery photos** (`public/gallery/*`). Empty — the six entries in
      `src/data/gallery.json` are placeholders and render a visible
      "Photo coming soon" panel until real files are added.

### Already done

Logo, hero still and video, OG image and icons are all committed and wired up.
See `ASSETS.md` for the inventory and the provenance note. The hero is
generated imagery kept deliberately as a brand image, not a photo of Kayla's
work.

### Technical

- [ ] Run Lighthouse on https://kaylas-cakes.pages.dev, mobile profile.
- [ ] Check the hero video loop in Safari specifically.
- [ ] Change the admin password from the initial one.
- [ ] Connect Git for auto-deploy (see above).
- [ ] Turn on email notification once Kayla has a domain.

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
