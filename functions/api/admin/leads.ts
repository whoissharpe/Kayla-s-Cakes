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

  return Response.json({ leads });
};
