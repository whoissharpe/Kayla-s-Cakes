export interface Env {
  DB: D1Database;
  PHOTOS: R2Bucket;
  RESEND_API_KEY: string;
  NOTIFY_EMAIL: string;
  FROM_EMAIL: string;
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
