/**
 * "What she makes" cards. Sourced from her Instagram highlights
 * (Sets, Valentine's, Cake pops, Cupcakes, Thanksgiving, Halloween)
 * plus the brief.
 *
 * ORDER IS MEANINGFUL, twice over:
 *   - The LAST entry renders as a full-width feature card, not a grid
 *     cell (see the :last-child:nth-child(3n + 1) rule in
 *     Categories.astro). With seven entries that slot is position 7.
 *     Seasonal holds it because three of her six Instagram highlights
 *     are holidays — it's the closest thing she has to a headline line.
 *   - Within the 3x2 grid above it, the categories she actually
 *     highlights come first. Wedding cakes and strawberries are not
 *     highlighted on her profile, so they sit last of the grid cells —
 *     wedding still ahead of strawberries, since it's the higher-value
 *     order of the two.
 *
 * The 01-07 numerals and the per-card gradients are positional, so
 * reordering this array renumbers and re-tints the cards automatically.
 *
 * `image` is OPTIONAL. Leave it empty and the card renders a designed
 * panel instead — deliberately typographic rather than a stand-in photo,
 * because a generated cake photo reads as fake and undersells real work.
 *
 * To add a real photo: drop the file in public/brand/categories/ and set
 * `image` to its path. Nothing else needs changing.
 */
export type Category = {
  slug: string;
  title: string;
  blurb: string;
  image?: string;
};

export const categories: Category[] = [
  {
    slug: 'custom-cakes',
    title: 'Custom cakes',
    blurb:
      'Birthdays, showers, and the occasional "just because." Tell her the theme and she builds it.',
    image: '',
  },
  {
    slug: 'cupcakes',
    title: 'Cupcakes',
    blurb: 'By the dozen, decorated to match the rest of the party.',
    image: '',
  },
  {
    slug: 'cake-pops',
    title: 'Cake pops',
    blurb: 'Neat, poppable, and the first thing to disappear off the table.',
    image: '',
  },
  {
    slug: 'dessert-sets',
    title: 'Dessert sets & boxes',
    blurb: 'A mix of treats put together as one set, ready to hand over.',
    image: '',
  },
  {
    slug: 'wedding-cakes',
    title: 'Wedding cakes',
    blurb:
      'Multi-tiered displays with handcrafted sugar flowers, every tier baked from scratch.',
    image: '',
  },
  {
    slug: 'strawberries',
    title: 'Chocolate-covered strawberries',
    blurb: 'Dipped and finished by hand. A standing favorite.',
    image: '',
  },
  {
    slug: 'seasonal',
    title: 'Seasonal',
    blurb: "Valentine's, Thanksgiving, and whatever the calendar brings next.",
    image: '',
  },
];
