# Download list

Every generated asset, with its direct URL and where it goes.

**Don't paste these into chat** — images sent in conversation can't be written
to disk. Save them to the paths below, then commit and push; that's the one
route that actually gets them into the project.

Base URL for every file:

```
https://d8j0ntlcm91z4.cloudfront.net/user_3GGqBW4zpaaDAVr4CQwHyT8geRQ/
```

---

## 1. Logo — 2 files, required

You already picked these two. Filenames on the CDN:

| Save as | File |
|---|---|
| `public/brand/logo-lockup.png` | pick your favourite of `hf_20260831_151534_913476a4-…`, `…_71496972-…`, `…_e2395381-…`, `…_3ef11b4e-…` |
| `public/brand/logo-mark.png` | pick from `hf_20260831_151530_3368dab1-…`, `…_902f2904-…`, `…_43d52f9b-…`, `…_c284f96e-…` |

The two you pasted into chat earlier were one lockup and one mark — use those.

## 2. Hero — 2 files, required

| Save as | File |
|---|---|
| `public/brand/hero-cake.jpg` | `hf_20260831_152954_db06d2d2-65be-4c56-9afa-d3ab8c9b966d.png` (image 3, the one you chose) |
| `public/brand/hero-cake-spin.mp4` | `hf_20260831_154159_6f670b46-5934-4161-8392-b23bbbf3b2ce.mp4` |

**Compress the video first — CI will reject it otherwise** (the 800KB guard):

```bash
ffmpeg -i hero-cake-spin-raw.mp4 -vf scale=1280:-2 -c:v libx264 \
  -crf 30 -preset slow -an -movflags +faststart \
  public/brand/hero-cake-spin.mp4
```

And make a WebP of the poster so the `<picture>` element has its preferred source:

```bash
npx @squoosh/cli --webp '{"quality":80}' --resize '{"width":1600}' \
  -d public/brand public/brand/hero-cake.jpg
```

## 3. Category cards — 6 files

All from the batch at `hf_20260831_1550*`:

| Save as | File | Subject |
|---|---|---|
| `public/brand/categories/custom-cakes.webp` | `hf_20260831_155011_76f9d72c-de01-4225-af51-26df54e8b879.png` | Mint cake, gold drip |
| `public/brand/categories/cupcakes.webp` | `hf_20260831_155011_9eeb5ccc-4c54-4c39-bf0d-46b9072b0bb2.png` | Row of cupcakes |
| `public/brand/categories/cake-pops.webp` | `hf_20260831_155010_47dd9286-1ab3-46d9-b5fc-a97b2ff2777b.png` | Cake pops on sticks |
| `public/brand/categories/strawberries.webp` | `hf_20260831_155011_fa6fc090-16fb-4e79-a0dd-7c11e52b6cf8.png` | Dipped strawberries |
| `public/brand/categories/dessert-sets.webp` | `hf_20260831_155010_65f7e161-ba6a-421a-a954-fc7da9c69e1c.png` | Open dessert box |
| `public/brand/categories/seasonal.webp` | `hf_20260831_155011_02551c3b-0233-46e2-852d-df9b68f49a10.png` | Seasonal cookies + cake |

Resize to ~800px wide and convert to WebP — they render at about 400px:

```bash
npx @squoosh/cli --webp '{"quality":80}' --resize '{"width":800}' \
  -d public/brand/categories *.png
```

## 4. Social + icon — 2 files

| Save as | File | Notes |
|---|---|---|
| `public/brand/og.png` | `hf_20260831_155010_9c28aba3-dab0-47cc-8f40-3be566b65157.png` | Resize to exactly **1200×630** |
| `public/brand/favicon.png` | `hf_20260831_155011_c1280c60-2956-4e64-987e-8ee356535c90.png` | Also save a 180×180 copy as `apple-touch-icon.png` |

The layout currently asks for `favicon.svg`. Since this one is a PNG, either
trace it to SVG or change one line in `src/layouts/Base.astro`:

```html
<link rel="icon" href="/brand/favicon.png" type="image/png" />
```

---

## Pushing them

```bash
git checkout claude/kaylascakes-website-snt0pi
git pull

# ...save the files into public/brand/ as above...

find public -type f -size +800k     # must print nothing, or CI fails
git add public/
git commit -m "feat: add generated brand assets"
git push
```

Once that lands, say the word and I'll pull them, verify the sizes, check the
hero renders, and fix anything that needs adjusting.

## If you'd rather not use the command line

GitHub's web UI takes drag-and-drop: open the repo, switch to the
`claude/kaylascakes-website-snt0pi` branch, navigate to `public/brand/`, then
**Add file → Upload files**. Commit straight to the branch. Do compress the
video first either way — the CI check is not optional.
