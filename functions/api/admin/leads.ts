import type { Env } from '../../_lib/types';
import { isAuthed, unauthorized } from '../../_lib/auth';

/** GET /api/admin/leads — all leads, newest first. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthed(request, env.SESSION_SECRET))) return unauthorized();

  const { results } = await env.DB
    .prepare('SELECT * FROM leads ORDER BY created_at DESC')
    .all();

  const leads = (results ?? []).map((r: any) => ({
    ...r,
    photo_keys: JSON.parse(r.photo_keys || '[]'),
  }));

  // Tells the dashboard whether to expect emails, so Kayla is never left
  // wondering why nothing landed in her inbox.
  const emailConfigured = Boolean(
    env.RESEND_API_KEY && env.NOTIFY_EMAIL && env.FROM_EMAIL,
  );

  return Response.json({ leads, emailConfigured, photosConfigured: Boolean(env.PHOTOS) });
};
