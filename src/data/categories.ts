/**
 * "What she makes" cards. Sourced from her Instagram highlights
 * (Sets, Valentine's, Cake pops, Cupcakes, Thanksgiving) plus the brief.
 *
 * `image` points at public/brand/categories/. Generated illustrations are
 * PLACEHOLDERS — see README "Before launch".
 */
export type Category = {
  slug: string;
  title: string;
  blurb: string;
  image: string;
};

export const categories: Category[] = [
  {
    slug: 'custom-cakes',
    title: 'Custom cakes',
    blurb:
      'Birthdays, showers, and the occasional "just because." Tell her the theme and she builds it.',
    image: '/brand/categories/custom-cakes.webp',
  },
  {
    slug: 'cupcakes',
    title: 'Cupcakes',
    blurb: 'By the dozen, decorated to match the rest of the party.',
    image: '/brand/categories/cupcakes.webp',
  },
  {
    slug: 'cake-pops',
    title: 'Cake pops',
    blurb: 'Neat, poppable, and the first thing to disappear off the table.',
    image: '/brand/categories/cake-pops.webp',
  },
  {
    slug: 'strawberries',
    title: 'Chocolate-covered strawberries',
    blurb: 'Dipped and finished by hand. A standing favorite.',
    image: '/brand/categories/strawberries.webp',
  },
  {
    slug: 'dessert-sets',
    title: 'Dessert sets & boxes',
    blurb: 'A mix of treats put together as one set, ready to hand over.',
    image: '/brand/categories/dessert-sets.webp',
  },
  {
    slug: 'seasonal',
    title: 'Seasonal',
    blurb: "Valentine's, Thanksgiving, and whatever the calendar brings next.",
    image: '/brand/categories/seasonal.webp',
  },
];
