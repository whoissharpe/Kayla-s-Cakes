import type { Env } from '../../../_lib/types';
import { isAuthed, unauthorized } from '../../../_lib/auth';

/**
 * GET /api/admin/photo/<r2-key> — inspiration photos, behind the admin gate.
 * The R2 bucket itself stays private; this is the only way in.
 */
export const onRequestGet: PagesFunction<Env> = async ({ request, env, params }) => {
  if (!(await isAuthed(request, env.SESSION_SECRET))) return unauthorized();

  const segments = Array.isArray(params.path) ? params.path : [params.path];
  const key = segments.map((s) => decodeURIComponent(String(s))).join('/');

  // Only ever serve lead uploads, whatever the path says.
  if (!key.startsWith('leads/')) {
    return new Response('Not found', { status: 404 });
  }

  const object = await env.PHOTOS.get(key);
  if (!object) return new Response('Not found', { status: 404 });

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Cache-Control': 'private, max-age=3600',
    },
  });
};
