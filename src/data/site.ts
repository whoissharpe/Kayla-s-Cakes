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
  owner: 'Kayla',
  positioning:
    'Custom cakes, cupcakes, and sweet treats — every tier baked from scratch in Jacksonville.',

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
  serviceArea: 'Jacksonville, Ponte Vedra, St. Augustine and Nocatee',
  serviceAreaList: ['Jacksonville', 'Ponte Vedra', 'St. Augustine', 'Nocatee'],

  /** What sets her apart, in her own words. */
  differentiators: [
    '100% from scratch — no boxed mixes, no artificial shortening',
    'Custom color matching and a personal consultation',
    'Real butter, vanilla bean and Belgian chocolate',
  ],

  // --- Legal ---------------------------------------------------------------
  /**
   * ⚠️  NEEDS A DECISION FROM KAYLA BEFORE LAUNCH.
   *
   * She describes the business as a "licensed Florida Cottage Law bakery"
   * but also says she does not bake at home. Those are two different things
   * in Florida and only one can be true:
   *
   *   - A cottage food operation IS home-based, is not licensed or
   *     inspected, and MUST carry the statement below on product labels
   *     (Fla. Stat. § 500.80).
   *   - A licensed commercial kitchen is inspected and must NOT use this
   *     statement, because it would be untrue.
   *
   * The statement is kept here only because it matches her own wording.
   * If she is licensed rather than cottage, delete it — the footer renders
   * nothing when this is an empty string.
   */
  cottageDisclosure:
    "Made in a cottage food operation that is not subject to Florida's food safety regulations.",

  /** Endpoint for the order form. Set to the deployed Worker URL. */
  orderEndpoint: 'https://kaylas-cakes-api.workers.dev',
} as const;
