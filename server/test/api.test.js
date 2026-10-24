import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { openDb } from '../src/db.js';
import { createApp } from '../src/app.js';
import { seedDemo, DEMO_SLUG, DEMO_EDIT_KEY } from '../src/seed.js';

process.env.NODE_ENV = 'test';
process.env.AI_ENGINE = 'rules';

let server;
let base;
let db;

before(async () => {
  db = openDb(':memory:');
  seedDemo(db);
  server = createApp({ db }).listen(0);
  await new Promise((r) => server.once('listening', r));
  base = `http://127.0.0.1:${server.address().port}/api`;
});

after(() => {
  server.close();
  db.close();
});

const call = async (method, path, body, headers = {}) => {
  const res = await fetch(base + path, {
    method,
    headers: { 'content-type': 'application/json', ...headers },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, body: await res.json() };
};

test('health reports the active engine', async () => {
  const { status, body } = await call('GET', '/health');
  assert.equal(status, 200);
  assert.deepEqual(body, { ok: true, aiEngine: 'rules' });
});

test('generate validates input', async () => {
  const { status, body } = await call('POST', '/generate', { transcript: 'hi' });
  assert.equal(status, 400);
  assert.equal(body.error.code, 'VALIDATION_ERROR');
});

test('full journey: generate → publish → view → edit → inquiry', async () => {
  const gen = await call('POST', '/generate', {
    transcript: "I run Maya's Bakery on MG Road, open 9 AM to 8 PM. Sourdough for ₹150 and croissants for ₹80. WhatsApp 98765 43210.",
  });
  assert.equal(gen.status, 200);
  assert.equal(gen.body.engine, 'rules');
  assert.equal(gen.body.store.products.length, 2);

  const pub = await call('POST', '/stores', { store: gen.body.store, engine: gen.body.engine });
  assert.equal(pub.status, 201);
  // Demo store already owns "mayas-bakery", so the new one gets a suffix.
  assert.equal(pub.body.slug, 'maya-s-bakery');
  assert.ok(pub.body.editToken.length >= 32);
  const { slug, editToken } = pub.body;

  const again = await call('POST', '/stores', { store: gen.body.store });
  assert.equal(again.body.slug, 'maya-s-bakery-2');

  const view = await call('GET', `/stores/${slug}`);
  assert.equal(view.status, 200);
  assert.equal(view.body.store.storeName, "Maya's Bakery");
  assert.equal(view.body.editToken, undefined, 'edit token must never be exposed publicly');

  const edited = { ...view.body.store, tagline: 'Warm bread, warm hearts' };
  const denied = await call('PUT', `/stores/${slug}`, { store: edited }, { 'x-edit-token': 'wrong' });
  assert.equal(denied.status, 401);
  const put = await call('PUT', `/stores/${slug}`, { store: edited }, { 'x-edit-token': editToken });
  assert.equal(put.status, 200);
  assert.equal(put.body.store.tagline, 'Warm bread, warm hearts');

  const badInquiry = await call('POST', `/stores/${slug}/inquiries`, { name: '', contact: 'x', message: '' });
  assert.equal(badInquiry.status, 400);
  const inquiry = await call('POST', `/stores/${slug}/inquiries`, { name: 'Rahul', contact: '9876500000', message: 'Do you take cake orders?' });
  assert.equal(inquiry.status, 201);

  assert.equal((await call('GET', `/stores/${slug}/inquiries`)).status, 401);
  const list = await call('GET', `/stores/${slug}/inquiries`, undefined, { 'x-edit-token': editToken });
  assert.equal(list.body.inquiries.length, 1);
  assert.equal(list.body.inquiries[0].status, 'new');

  const done = await call('PATCH', `/stores/${slug}/inquiries/${list.body.inquiries[0].id}`, { status: 'done' }, { 'x-edit-token': editToken });
  assert.equal(done.body.inquiry.status, 'done');

  const owner = await call('GET', `/stores/${slug}/owner`, undefined, { 'x-edit-token': editToken });
  assert.deepEqual(owner.body.inquiries, { total: 1, open: 0 });
});

test('publish rejects unusable stores', async () => {
  const { status } = await call('POST', '/stores', { store: 'nope' });
  assert.equal(status, 400);
});

test('demo store is seeded and listed; unknown store 404s', async () => {
  const list = await call('GET', '/stores');
  assert.ok(list.body.stores.some((s) => s.slug === DEMO_SLUG));
  const owner = await call('GET', `/stores/${DEMO_SLUG}/owner`, undefined, { 'x-edit-token': DEMO_EDIT_KEY });
  assert.equal(owner.status, 200);
  assert.equal((await call('GET', '/stores/does-not-exist')).status, 404);
  assert.equal((await call('GET', '/nope')).status, 404);
});
