/**
 * Single source of truth for business facts and copy that Kayla may want changed.
 * Edit here, not in components.
 *
 * ⚠️  Fields marked UNCONFIRMED were found via web search, NOT from Kayla directly.
 *     They must be confirmed before launch — see README "Before launch".
 */

export const site = {
  name: "Kayla's Cakes",
  tagline: 'baked with love',
  owner: 'Kayla Duke',
  positioning:
    'Custom cakes, cupcakes, and sweet treats, baked at home in Jacksonville.',

  // --- Contact -------------------------------------------------------------
  /** UNCONFIRMED — verify with Kayla before launch. */
  email: 'kaylascakesbakedwithlove@gmail.com',
  /** UNCONFIRMED — verify with Kayla before launch. */
  phone: '(904) 309-2270',
  phoneHref: 'tel:+19043092270',

  // --- Social --------------------------------------------------------------
  instagram: 'https://www.instagram.com/kaylascakesbakedwithlove_',
  instagramHandle: '@kaylascakesbakedwithlove_',
  facebook: 'https://www.facebook.com/kaylascakesbakedwithlove/',

  /** Kept as a documented fallback ordering path. */
  googleForm:
    'https://docs.google.com/forms/d/e/1FAIpQLSd5qRtJILmluv6IOvz0e4_HQsd5UQ_LUugmPtPuIp-2tp8pMA/viewform',

  // --- Service area --------------------------------------------------------
  city: 'Jacksonville',
  state: 'FL',
  /** UNCONFIRMED — Kayla to confirm radius and whether she delivers at all. */
  serviceArea: 'Jacksonville, FL and surrounding areas',

  // --- Legal ---------------------------------------------------------------
  /**
   * Florida cottage food operations must carry this statement on product
   * labels (Fla. Stat. § 500.80), at 10pt minimum in a contrasting color.
   * Shown in the footer as good-faith transparency.
   * ⚠️  Kayla should confirm exact wording/placement for her packaging.
   */
  cottageDisclosure:
    "Made in a cottage food operation that is not subject to Florida's food safety regulations.",

  /** Endpoint for the order form. Set to the deployed Worker URL. */
  orderEndpoint: 'https://kaylas-cakes-api.workers.dev',
} as const;
