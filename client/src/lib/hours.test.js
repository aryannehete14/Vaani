import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getOpenStatus, parseDays, formatTime, weekSchedule } from './hours.js';
import { buildOrderMessage, waLink } from './whatsapp.js';
import { formatPrice, initials } from './format.js';

// 2026-10-20 is a Tuesday.
const at = (day, hh, mm = 0) => new Date(2026, 9, 19 + day, hh, mm);
const MON = 0, TUE = 1, SAT = 5, SUN = 6;
const shop = { open: '09:00', close: '20:00', days: 'Mon-Sat' };

test('parseDays handles canonical formats', () => {
  assert.deepEqual([...parseDays('Mon-Sat')].sort(), [0, 1, 2, 3, 4, 5]);
  assert.deepEqual([...parseDays('Fri-Mon')].sort(), [0, 4, 5, 6]);
  assert.deepEqual([...parseDays('Mon, Wed, Fri')].sort(), [0, 2, 4]);
  assert.equal(parseDays('Daily').size, 7);
  assert.equal(parseDays('').size, 7);
});

test('open during hours, closed outside', () => {
  assert.equal(getOpenStatus(shop, at(TUE, 14)).isOpen, true);
  assert.equal(getOpenStatus(shop, at(TUE, 14)).detail, 'Closes 8:00 PM');
  assert.equal(getOpenStatus(shop, at(TUE, 8)).detail, 'Opens today 9:00 AM');
  assert.equal(getOpenStatus(shop, at(TUE, 20)).isOpen, false);
  assert.equal(getOpenStatus(shop, at(TUE, 21)).detail, 'Opens tomorrow 9:00 AM');
});

test('closed day finds next opening', () => {
  const s = getOpenStatus(shop, at(SUN, 11));
  assert.equal(s.isOpen, false);
  assert.equal(s.detail, 'Opens tomorrow 9:00 AM');
  assert.equal(getOpenStatus(shop, at(SAT, 21)).detail, 'Opens Mon 9:00 AM');
});

test('closing soon within 30 minutes', () => {
  const s = getOpenStatus(shop, at(MON, 19, 40));
  assert.equal(s.isOpen, true);
  assert.equal(s.closingSoon, true);
  assert.equal(s.label, 'Closing soon');
});

test('overnight hours span midnight', () => {
  const late = { open: '18:00', close: '02:00', days: 'Mon-Sat' };
  assert.equal(getOpenStatus(late, at(TUE, 23)).isOpen, true);
  assert.equal(getOpenStatus(late, at(TUE, 1)).isOpen, true); // Monday night
  assert.equal(getOpenStatus(late, at(MON, 1)).isOpen, false); // Sunday night: closed Sunday
  assert.equal(getOpenStatus(late, at(TUE, 3)).isOpen, false);
});

test('24 hour shops', () => {
  const s = getOpenStatus({ open: '00:00', close: '23:59', days: 'Daily' }, at(SUN, 3));
  assert.equal(s.isOpen, true);
  assert.equal(s.detail, 'Open 24 hours');
});

test('formatTime and weekSchedule', () => {
  assert.equal(formatTime('09:00'), '9:00 AM');
  assert.equal(formatTime('20:30'), '8:30 PM');
  assert.equal(formatTime('00:00'), '12:00 AM');
  const week = weekSchedule(shop, at(TUE, 12));
  assert.equal(week[1].isToday, true);
  assert.equal(week[6].range, 'Closed');
});

test('WhatsApp order message', () => {
  const store = { storeName: "Maya's Bakery", currency: 'INR', contact: { whatsapp: '919876543210' } };
  const msg = buildOrderMessage(store, [
    { product: { name: 'Croissants', price: 80 }, qty: 2 },
    { product: { name: 'Sourdough', price: 150 }, qty: 1 },
  ]);
  assert.match(msg, /2 × Croissants: ₹160/);
  assert.match(msg, /1 × Sourdough: ₹150/);
  assert.match(msg, /Total: ₹310/);
  assert.equal(waLink('+91 98765 43210', 'hi'), 'https://wa.me/919876543210?text=hi');
});

test('format helpers', () => {
  assert.equal(formatPrice(4500, 'INR'), '₹4,500');
  assert.equal(formatPrice(5.5, 'USD'), '$5.50');
  assert.equal(initials("Maya's Bakery"), 'MB');
});
