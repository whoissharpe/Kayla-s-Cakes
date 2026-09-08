import type { Env } from '../../_lib/types';
import { isAuthed, unauthorized } from '../../_lib/auth';

const cell = (v: unknown) => {
  const s = v === null || v === undefined ? '' : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

/** GET /api/admin/export — CSV of every lead, for spreadsheets or backup. */
export const onRequestGet: PagesFunction<Env> = async ({ request, env }) => {
  if (!(await isAuthed(request, env.SESSION_SECRET))) return unauthorized();

  const cols = [
    'created_at', 'name', 'status', 'contact_method', 'phone', 'email',
    'event_date', 'item_type', 'flavor', 'servings', 'theme', 'budget',
    'notes', 'admin_notes',
  ];

  const { results } = await env.DB
    .prepare('SELECT * FROM leads ORDER BY created_at DESC').all();

  const csv = [
    cols.join(','),
    ...(results ?? []).map((r: any) => cols.map((c) => cell(r[c])).join(',')),
  ].join('\n');

  const stamp = new Date().toISOString().split('T')[0];
  return new Response(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="kaylas-cakes-orders-${stamp}.csv"`,
    },
  });
};
