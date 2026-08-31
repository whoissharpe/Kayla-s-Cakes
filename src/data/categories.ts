/**
 * "What she makes" cards. Sourced from her Instagram highlights
 * (Sets, Valentine's, Cake pops, Cupcakes, Thanksgiving) plus the brief.
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
    slug: 'wedding-cakes',
    title: 'Wedding cakes',
    blurb:
      'Multi-tiered displays with handcrafted sugar flowers, every tier baked from scratch.',
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
    slug: 'strawberries',
    title: 'Chocolate-covered strawberries',
    blurb: 'Dipped and finished by hand. A standing favorite.',
    image: '',
  },
  {
    slug: 'dessert-sets',
    title: 'Dessert sets & boxes',
    blurb: 'A mix of treats put together as one set, ready to hand over.',
    image: '',
  },
  {
    slug: 'seasonal',
    title: 'Seasonal',
    blurb: "Valentine's, Thanksgiving, and whatever the calendar brings next.",
    image: '',
  },
];
