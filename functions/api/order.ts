/**
 * POST /api/order — public order intake.
 *
 * Runs on the site's own origin (Cloudflare Pages Functions), so the admin
 * session cookie is same-origin and no CORS is needed.
 */
import type { Env } from '../_lib/types';

const MAX_FILES = 5;
const MAX_BYTES = 5 * 1024 * 1024;
const RATE_LIMIT = 5;              // submissions ...
const RATE_WINDOW_MS = 60 * 60_000; // ... per hour, per IP

const str = (v: File | string | null, max = 2000) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  try {
    const form = await request.formData();

    // --- Honeypot: silently accept so bots don't learn anything -----------
    if (str(form.get('company'))) {
      return Response.json({ ok: true });
    }

    // --- Rate limit -------------------------------------------------------
    const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
    const since = Date.now() - RATE_WINDOW_MS;
    await env.DB.prepare('DELETE FROM submissions WHERE created_at < ?')
      .bind(since).run();
    const { results } = await env.DB
      .prepare('SELECT COUNT(*) AS n FROM submissions WHERE ip = ? AND created_at > ?')
      .bind(ip, since).all<{ n: number }>();
    if ((results?.[0]?.n ?? 0) >= RATE_LIMIT) {
      return Response.json(
        { error: "That's a few too many submissions. Please text her instead." },
        { status: 429 },
      );
    }

    // --- Validate (server-side; the client checks are only a convenience) --
    const name = str(form.get('name'), 120);
    const contactMethod = str(form.get('contactMethod'), 10) === 'email' ? 'email' : 'text';
    const phone = str(form.get('phone'), 40);
    const email = str(form.get('email'), 200);
    const eventDate = str(form.get('eventDate'), 20);
    const itemType = str(form.get('itemType'), 80);

    const errors: string[] = [];
    if (!name) errors.push('Name is required.');
    if (!itemType) errors.push('Please choose what you would like.');

    if (contactMethod === 'email') {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('A valid email is required.');
    } else if (phone.replace(/\D/g, '').length < 10) {
      errors.push('A valid phone number is required.');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(eventDate)) {
      errors.push('A valid event date is required.');
    } else {
      const picked = new Date(`${eventDate}T00:00:00Z`);
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);
      if (Number.isNaN(picked.getTime()) || picked < today) {
        errors.push('The event date must be in the future.');
      }
    }

    if (errors.length) {
      return Response.json({ error: errors.join(' ') }, { status: 400 });
    }

    // --- Photos -> R2 -----------------------------------------------------
    const id = crypto.randomUUID();
    const files = form.getAll('photos').filter((f): f is File => f instanceof File && f.size > 0);

    if (files.length > MAX_FILES) {
      return Response.json({ error: `Up to ${MAX_FILES} photos, please.` }, { status: 400 });
    }

    // R2 may not be enabled on the account yet. Losing the photos is a far
    // better outcome than losing the enquiry, so carry on without them.
    const photoKeys: string[] = [];
    const canStorePhotos = Boolean(env.PHOTOS);
    if (files.length && !canStorePhotos) {
      console.warn('Photos submitted but R2 is not bound; saving lead without them');
    }
    for (const [i, file] of canStorePhotos ? files.entries() : []) {
      if (file.size > MAX_BYTES) {
        return Response.json({ error: `"${file.name}" is larger than 5 MB.` }, { status: 400 });
      }
      if (!file.type.startsWith('image/')) {
        return Response.json({ error: 'Inspiration files must be images.' }, { status: 400 });
      }
      const key = `leads/${id}/${i}-${file.name.replace(/[^\w.\-]/g, '_').slice(0, 80)}`;
      await env.PHOTOS!.put(key, file.stream(), {
        httpMetadata: { contentType: file.type },
      });
      photoKeys.push(key);
    }

    // --- Persist ----------------------------------------------------------
    const now = new Date().toISOString();
    const lead = {
      id, created_at: now, name, contact_method: contactMethod, phone, email,
      event_date: eventDate, item_type: itemType,
      flavor: str(form.get('flavor'), 200),
      servings: str(form.get('servings'), 200),
      theme: str(form.get('theme'), 4000),
      budget: str(form.get('budget'), 100),
      notes: str(form.get('notes'), 1000),
      photo_keys: JSON.stringify(photoKeys),
    };

    await env.DB.prepare(
      `INSERT INTO leads (id, created_at, name, contact_method, phone, email,
        event_date, item_type, flavor, servings, theme, budget, notes,
        photo_keys, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,'new')`,
    ).bind(
      lead.id, lead.created_at, lead.name, lead.contact_method, lead.phone,
      lead.email, lead.event_date, lead.item_type, lead.flavor, lead.servings,
      lead.theme, lead.budget, lead.notes, lead.photo_keys,
    ).run();

    await env.DB.prepare('INSERT INTO submissions (ip, created_at) VALUES (?, ?)')
      .bind(ip, Date.now()).run();

    // --- Notify Kayla, if email is configured. -----------------------------
    // The lead is already saved at this point. Email is a convenience on top,
    // never a dependency: whether it is switched off or simply fails, the
    // order is safe and visible on /admin either way.
    if (isEmailConfigured(env)) {
      try {
        await sendNotification(env, lead, photoKeys.length);
      } catch (err) {
        console.error('Lead saved but notification failed', lead.id, err);
      }
    } else {
      console.log('Lead saved; email notification is not configured', lead.id);
    }

    return Response.json({ ok: true, id });
  } catch (err) {
    console.error('Order submission failed', err);
    return Response.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
};

/** All three must be present before we try to send anything. */
function isEmailConfigured(env: Env): boolean {
  return Boolean(env.RESEND_API_KEY && env.NOTIFY_EMAIL && env.FROM_EMAIL);
}

async function sendNotification(
  env: Env,
  lead: Record<string, string>,
  photoCount: number,
) {

  const row = (label: string, value: string) =>
    value
      ? `<tr><td style="padding:6px 14px 6px 0;color:#666;vertical-align:top;white-space:nowrap">${label}</td>
             <td style="padding:6px 0"><strong>${escapeHtml(value)}</strong></td></tr>`
      : '';

  const reply = lead.contact_method === 'email' ? lead.email : lead.phone;

  const html = `
    <div style="font-family:system-ui,-apple-system,sans-serif;max-width:560px;color:#141414">
      <p style="font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:#22685D;margin:0 0 4px">
        New order inquiry
      </p>
      <h1 style="font-size:22px;margin:0 0 18px">${escapeHtml(lead.name)}</h1>
      <table style="border-collapse:collapse;font-size:14px;width:100%">
        ${row('Wants', lead.item_type)}
        ${row('Event date', lead.event_date)}
        ${row('Prefers', lead.contact_method === 'email' ? 'Email' : 'Text')}
        ${row('Phone', lead.phone)}
        ${row('Email', lead.email)}
        ${row('Flavor', lead.flavor)}
        ${row('Size / servings', lead.servings)}
        ${row('Budget', lead.budget)}
        ${row('Theme', lead.theme)}
        ${row('Anything else', lead.notes)}
        ${row('Inspiration photos', photoCount ? `${photoCount} attached — view in the admin page` : '')}
      </table>
      <p style="margin:22px 0 0;font-size:13px;color:#666">
        Open your orders page to reply, add notes, and mark this booked.
      </p>
    </div>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `Kayla's Cakes <${env.FROM_EMAIL}>`,
      to: [env.NOTIFY_EMAIL!],
      reply_to: reply || undefined,
      subject: `New order: ${lead.name} — ${lead.item_type} for ${lead.event_date}`,
      html,
    }),
  });

  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}
