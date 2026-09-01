# Brand assets

Everything the site needs is committed under `public/brand/`. Nothing has to be
downloaded or dropped in by hand.

| File | Size | What it is |
|---|---|---|
| `hero-cake.webp` / `.jpg` | 99KB / 204KB | Hero still — the turntable cake, 2400×1340. Upscaled 2× with a Lanczos resample plus a light unsharp mask from the original 1600×893 generation, which was visibly soft once stretched to `object-fit: cover` on wide viewports. JPEG is the fallback for browsers without WebP. |
| `hero-cake-spin.mp4` | 164KB | The 5-second spinning loop. 1280 wide, CRF 32, no audio, faststart. |
| `logo-mark-cutout.webp` | 26KB | The glyph (cherry, swirl, chocolate drip), **transparent** and cropped tight to its artwork. Used everywhere the mark appears — header, hero badge, About, both watermarks, footer — because a transparent PNG/WebP has no canvas colour to clash with whatever's behind it. Where the full wordmark needs to appear next to it (Header, Footer), it's set as real text rather than baked into a raster image. |
| `categories/*.webp` | 8–29KB each | The six "What she makes" cards. |
| `og.jpg` | 25KB | Social share image, exactly 1200×630. |
| `favicon.png` | 20KB | 512×512. |
| `apple-touch-icon.png` | 3KB | 180×180. |

`public/` totals about 590KB. CI fails if any single file exceeds 800KB — see
the guard in `.github/workflows/ci.yml`.

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
