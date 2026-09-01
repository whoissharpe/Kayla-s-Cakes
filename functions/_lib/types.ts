export interface Env {
  DB: D1Database;
  /**
   * Inspiration photo storage. OPTIONAL — R2 has to be enabled on the
   * account before the bucket can exist. Without it the order form still
   * works and leads still save; the photos are simply not kept, and the
   * form says so rather than failing the submission.
   */
  PHOTOS?: R2Bucket;
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
