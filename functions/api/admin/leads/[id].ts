import type { Env, LeadStatus } from '../../../_lib/types';
import { LEAD_STATUSES } from '../../../_lib/types';
import { isAuthed, unauthorized } from '../../../_lib/auth';

/** PATCH /api/admin/leads/:id — update status and/or admin notes. */
export const onRequestPatch: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAuthed(request, env.SESSION_SECRET))) return unauthorized();

  const id = String(params.id);
  type Patch = { status?: string; admin_notes?: string };
  const body: Patch = await request.json<Patch>().catch(() => ({}) as Patch);

  const sets: string[] = [];
  const binds: unknown[] = [];

  if (body.status !== undefined) {
    if (!LEAD_STATUSES.includes(body.status as LeadStatus)) {
      return Response.json({ error: 'Unknown status.' }, { status: 400 });
    }
    sets.push('status = ?');
    binds.push(body.status);
  }

  if (body.admin_notes !== undefined) {
    sets.push('admin_notes = ?');
    binds.push(String(body.admin_notes).slice(0, 4000));
  }

  if (!sets.length) return Response.json({ error: 'Nothing to update.' }, { status: 400 });

  sets.push('updated_at = ?');
  binds.push(new Date().toISOString(), id);

  await env.DB.prepare(`UPDATE leads SET ${sets.join(', ')} WHERE id = ?`)
    .bind(...binds).run();

  return Response.json({ ok: true });
};

/** DELETE /api/admin/leads/:id — remove a lead and its photos. */
export const onRequestDelete: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAuthed(request, env.SESSION_SECRET))) return unauthorized();

  const id = String(params.id);
  const row = await env.DB.prepare('SELECT photo_keys FROM leads WHERE id = ?')
    .bind(id).first<{ photo_keys: string }>();

  if (env.PHOTOS) {
    for (const key of JSON.parse(row?.photo_keys || '[]')) {
      await env.PHOTOS.delete(key);
    }
  }
  await env.DB.prepare('DELETE FROM leads WHERE id = ?').bind(id).run();

  return Response.json({ ok: true });
};
