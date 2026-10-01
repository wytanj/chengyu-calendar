import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import {
  fnv1a32,
  formatDay,
  glyphs,
  parseDayKey,
  parsePack,
  parseScript,
  pickChengyu,
  resolveDay,
  screenFromHash,
  singaporeDayKey,
} from '../src/domain.ts';

const packRaw: unknown = JSON.parse(
  readFileSync(new URL('../src/pack.json', import.meta.url), 'utf8'),
);

test('fnv-1a 32-bit matches the published vectors', () => {
  assert.equal(fnv1a32(''), 0x811c9dc5);
  assert.equal(fnv1a32('a'), 0xe40c292c);
  assert.equal(fnv1a32('foobar'), 0xbf9cf968);
});

test('Singapore midnight rolls the calendar at 16:00 UTC', () => {
  const before = singaporeDayKey(new Date('2026-09-30T15:59:59.000Z'));
  const atMidnight = singaporeDayKey(new Date('2026-09-30T16:00:00.000Z'));
  assert.equal(before, '2026-09-30');
  assert.equal(atMidnight, '2026-10-01');
});

test('a bad query falls back to the Singapore day', () => {
  const now = new Date('2026-09-30T16:00:00.000Z');
  assert.equal(resolveDay('2026-02-31', now), '2026-10-01');
  assert.equal(resolveDay('tomorrow', now), '2026-10-01');
  assert.equal(resolveDay('2026-01-15', now), '2026-01-15');
});

test('the mast writes the civil date in Chinese numerals', () => {
  const reference = parseDayKey('2026-09-06');
  const national = parseDayKey('2026-10-01');
  assert.ok(reference && national);
  assert.deepEqual(formatDay(reference), {
    monthDay: '九月六日',
    year: '2026',
    weekday: '星期日',
  });
  assert.equal(formatDay(national).monthDay, '十月一日');
  assert.equal(formatDay(national).weekday, '星期四');
  assert.equal(formatDay(parseDayKey('2026-11-20')!).monthDay, '十一月二十日');
  assert.equal(parseDayKey('2026-02-29'), null);
  assert.equal(parseDayKey('2024-02-29'), '2024-02-29');
});

test('the pack is a sorted list of at least 100 four-character idioms', () => {
  const pack = parsePack(packRaw);
  assert.ok(pack.length >= 100);
  const ids = pack.map((item) => item.id);
  assert.deepEqual(ids, [...ids].sort((left, right) => (left < right ? -1 : left > right ? 1 : 0)));
  for (const item of pack) {
    assert.equal([...item.simplified].length, 4);
    assert.equal([...item.traditional].length, 4);
    assert.equal(item.pinyin.length, 4);
    assert.equal(item.gloss.length, 4);
  }
});

test('the same Singapore day picks the same idiom, whatever the file order', () => {
  const pack = parsePack(packRaw);
  const day = parseDayKey('2026-10-01');
  assert.ok(day);
  const again = parsePack([...(packRaw as unknown[])].reverse());
  assert.equal(pickChengyu(pack, day).id, pickChengyu(again, day).id);
  assert.equal(pickChengyu(pack, day).id, pack[fnv1a32(day) % pack.length].id);
  assert.notEqual(pickChengyu(pack, day).id, pickChengyu(pack, parseDayKey('2026-10-02')!).id);
});

test('a short or duplicate entry does not enter the pack', () => {
  const raw = packRaw as Record<string, unknown>[];
  const broken = { ...raw[0], simplified: '成语', id: '成语' };
  assert.throws(() => parsePack([broken, ...raw.slice(1)]), /four characters/);
  assert.throws(() => parsePack([raw[0], raw[0], ...raw.slice(1)]), /duplicate/);
});

test('script, glyphs, and the detail hash are the whole view state', () => {
  const pack = parsePack(packRaw);
  const item = pack.find((entry) => entry.simplified !== entry.traditional);
  assert.ok(item);
  assert.equal(glyphs(item, 'simplified'), item.simplified);
  assert.equal(glyphs(item, 'traditional'), item.traditional);
  assert.equal(parseScript(null), 'simplified');
  assert.equal(parseScript('traditional'), 'traditional');
  assert.equal(parseScript('other'), 'simplified');
  assert.equal(screenFromHash('#detail'), 'detail');
  assert.equal(screenFromHash(''), 'card');
});
