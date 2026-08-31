# Asset drop-in guide

The build environment can't reach the Higgsfield CDN, so the generated files
have to be saved from your Higgsfield library on an unrestricted machine and
placed here by hand. **The site references these exact paths** and will show
broken images until they exist.

Save each as the filename in the second column, then convert as noted.

## Logo — required

| Generated as | Save to | Notes |
|---|---|---|
| Full circular lockup (cake + "Kayla's Cakes" + "baked with love") | `public/brand/logo-lockup.png` | Keep the transparent/white circle |
| Mark only (cake on mint blob, no text) | `public/brand/logo-mark.png` | Used in the header and admin sign-in |

## Hero — required

| Generated as | Save to |
|---|---|
| Turntable cake, realistic, image **3** of 4 | `public/brand/hero-cake.webp` (also export `.avif` and `.jpg`) |
| The 5-second spinning video | `public/brand/hero-cake-spin.mp4` |

The hero `<picture>` looks for `.avif`, then `.webp`, then `.jpg`. Only the
`.jpg` is strictly required; the others just make it smaller.

**Compress the video before committing it.** It comes out of Higgsfield at
2560×1440, which is far larger than needed:

```bash
ffmpeg -i hero-cake-spin-raw.mp4 -vf scale=1280:-2 -c:v libx264 \
  -crf 30 -preset slow -an -movflags +faststart \
  public/brand/hero-cake-spin.mp4
```

`-an` strips the audio track — the hero is muted, so audio is pure waste.
Aim for under 600 KB. Anything much bigger will cost you the Lighthouse
performance target.

## Category cards — placeholders

| Generated subject | Save to |
|---|---|
| Mint cake with gold drip | `public/brand/categories/custom-cakes.webp` |
| Row of cupcakes | `public/brand/categories/cupcakes.webp` |
| Cake pops on sticks | `public/brand/categories/cake-pops.webp` |
| Dipped strawberries | `public/brand/categories/strawberries.webp` |
| Open dessert gift box | `public/brand/categories/dessert-sets.webp` |
| Seasonal cookies and cake | `public/brand/categories/seasonal.webp` |

Resize to about 800px wide before saving — they render at ~400px.

## Icons and social

| Generated as | Save to | Notes |
|---|---|---|
| Wide cake banner with empty left side | `public/brand/og.png` | Resize to exactly 1200×630 |
| Simple flat cake icon on mint circle | `public/brand/favicon.svg` + `apple-touch-icon.png` | See below |

The favicon was generated as a PNG. To get the `.svg` the site expects,
either trace it once in a vector editor, or change the `<link rel="icon">`
in `src/layouts/Base.astro` to point at a `.png` instead:

```html
<link rel="icon" href="/brand/favicon.png" type="image/png" />
```

Make `apple-touch-icon.png` 180×180.

## Gallery

`public/gallery/` is empty on purpose. Six placeholder entries in
`src/data/gallery.json` point at files that don't exist yet, and each carries
a visible "Placeholder" badge. Replace them with Kayla's real photos — see
"Adding gallery photos" in the README.

## Optimizing

```bash
# PNG/JPG -> WebP
npx @squoosh/cli --webp '{"quality":78}' -d public/brand input.png

# Check nothing is oversized
find public -type f -size +400k
```
