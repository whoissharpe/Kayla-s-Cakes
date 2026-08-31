export interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
  /**
   * Email notification is OPTIONAL. Leave these unset and the site works
   * fully — leads still save and still appear on /admin, they just don't
   * get emailed. Set all three to turn notifications on.
   */
  RESEND_API_KEY?: string;
  NOTIFY_EMAIL?: string;
  FROM_EMAIL?: string;
  ADMIN_PASSWORD_HASH: string;
  SESSION_SECRET: string;
}

export const LEAD_STATUSES = [
  'new',
  'quoted',
  'booked',
  'completed',
  'lost',
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];
