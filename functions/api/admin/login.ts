import type { Env } from '../../_lib/types';
import { verifyPassword, createSessionCookie } from '../../_lib/auth';

/** Slows brute force without needing extra storage. */
const DELAY_MS = 600;

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  type Body = { password?: string };
  const { password } = await request.json<Body>().catch(() => ({}) as Body);

  const ok = await verifyPassword(String(password || ''), env.ADMIN_PASSWORD_HASH);
  await new Promise((r) => setTimeout(r, DELAY_MS));

  if (!ok) {
    return Response.json({ error: 'That password is not right.' }, { status: 401 });
  }

  return new Response(JSON.stringify({ ok: true }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': await createSessionCookie(env.SESSION_SECRET),
    },
  });
};
