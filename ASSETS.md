# Brand assets

Everything the site needs is committed under `public/brand/`. Nothing has to be
downloaded or dropped in by hand.

| File | Size | What it is |
|---|---|---|
| `hero-cake.webp` / `.jpg` | 99KB / 204KB | Hero still — the turntable cake, 2400×1340. Upscaled 2× with a Lanczos resample plus a light unsharp mask from the original 1600×893 generation, which was visibly soft once stretched to `object-fit: cover` on wide viewports. JPEG is the fallback for browsers without WebP. |
| `hero-cake-spin.mp4` | 164KB | The 5-second spinning loop. 1280 wide, CRF 32, no audio, faststart. |
| `logo-lockup.webp` | 51KB | Glyph + the real cursive wordmark + tagline, exactly as designed — **transparent**. Its white canvas was colour-keyed out (flood-filled from the edges, so only the contiguous background goes transparent — the pastry's own pale colour and the white highlights inside the artwork stay put) rather than removed with an AI background-remover, which previously deleted the wordmark text outright. Used everywhere the full lockup appears — hero badge, About — since it's the actual logo art, not a retyped substitute. |
| `logo-mark-cutout.webp` | 30KB | Glyph only (cherry, swirl, chocolate drip), cropped tight from the same colour-keyed source. Used for the header, both faint watermarks, and the admin icons, where only the mark — not the full wordmark — fits. |
| `categories/*.webp` | 8–29KB each | The six "What she makes" cards. |
| `og.jpg` | 25KB | Social share image, exactly 1200×630. |
| `favicon.png` | 20KB | 512×512. |
| `apple-touch-icon.png` | 3KB | 180×180. |

`public/` totals about 684KB. CI fails if any single file exceeds 800KB — see
the guard in `.github/workflows/ci.yml`.

**The footer is the one exception.** Its background is dark, and the logo's
own wordmark linework is near-black — illegible there regardless of
transparency. So the footer sets the name as real text instead of using
`logo-lockup.webp`, in `Yellowtail` (`@fontsource/yellowtail`, self-hosted),
a bold connected script chosen to read close to the logo's own cursive
rather than the site's serif/sans pairing. Every other placement uses the
actual logo image, never a retyped stand-in.

## Provenance

All of these were generated, not photographed. That matters for two of them:

- **The hero** is a deliberate brand image. It is not a photograph of Kayla's
  work and should not be captioned as one, but it is intended to stay.
- **The category card images** are placeholders. They depict generic cakes in
  the brand palette and should be replaced with Kayla's real photos before
  launch. See the checklist in the README.

The logo, OG image and icons are brand assets and need no replacement.

## Re-optimising

If a replacement image comes in oversized:

```bash
# image -> WebP at a sane width
npx sharp-cli -i big.png -o public/brand/ --format webp --quality 78 resize 1600

# video -> small, muted, streamable
ffmpeg -i raw.mp4 -vf scale=1280:-2 -c:v libx264 -crf 32 -preset slow -an \
  -movflags +faststart -pix_fmt yuv420p public/brand/hero-cake-spin.mp4

# check nothing will trip CI
find public -type f -size +800k
```

Use JPEG, not PNG, for anything photographic — the OG image was 1.0MB as a PNG
and 25KB as a JPEG at the same dimensions.
