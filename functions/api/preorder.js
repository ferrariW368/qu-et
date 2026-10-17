// revU (17 Oct): pre-order requests while no payment can be taken (accountant: no money in before the tax
// certificate). The checkout posts here; rows land in D1 (binding DB). No payment, no third party.
const FIELDS = { email: 160, firstName: 60, lastName: 60, country: 80, address: 200, city: 80, postal: 20, phone: 30 };
const PRODUCTS = new Set(['peak', 'mid-levels']);
const json = (body, status = 200) => new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });

export async function onRequestPost({ request, env }) {
  if (!env.DB) return json({ ok: false, error: 'unavailable' }, 503);
  const raw = await request.text();
  if (raw.length > 4000) return json({ ok: false, error: 'too_large' }, 413);
  let data;
  try { data = JSON.parse(raw); } catch { return json({ ok: false, error: 'bad_json' }, 400); }
  if (data.website) return json({ ok: true }); // honeypot: bots fill hidden fields; pretend success, store nothing
  const row = {};
  for (const [key, max] of Object.entries(FIELDS)) {
    const value = String(data[key] ?? '').trim();
    if (value.length > max) return json({ ok: false, error: 'field_too_long', field: key }, 400);
    if (!value && key !== 'phone') return json({ ok: false, error: 'missing', field: key }, 400);
    row[key] = value;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) return json({ ok: false, error: 'email' }, 400);
  const items = {};
  for (const [id, count] of Object.entries(data.items || {})) {
    const n = Math.floor(Number(count));
    if (PRODUCTS.has(id) && n >= 1 && n <= 50) items[id] = n;
  }
  if (!Object.keys(items).length) return json({ ok: false, error: 'no_items' }, 400);
  const lang = data.lang === 'tr' ? 'tr' : 'en';
  await env.DB.prepare(`CREATE TABLE IF NOT EXISTS preorders (id INTEGER PRIMARY KEY AUTOINCREMENT, created_at TEXT NOT NULL, lang TEXT, email TEXT, first_name TEXT, last_name TEXT, country TEXT, address TEXT, city TEXT, postal TEXT, phone TEXT, items TEXT)`).run();
  await env.DB.prepare(`INSERT INTO preorders (created_at, lang, email, first_name, last_name, country, address, city, postal, phone, items) VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
    .bind(new Date().toISOString(), lang, row.email, row.firstName, row.lastName, row.country, row.address, row.city, row.postal, row.phone, JSON.stringify(items)).run();
  return json({ ok: true });
}

export const onRequest = () => json({ ok: false, error: 'method' }, 405);
