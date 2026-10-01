const dayBrand: unique symbol = Symbol('day');

export type DayKey = string & { readonly [dayBrand]: true };

export type Script = 'simplified' | 'traditional';

export type Screen = 'card' | 'detail';

export type Chengyu = {
  id: string;
  simplified: string;
  traditional: string;
  pinyin: readonly [string, string, string, string];
  gloss: readonly [string, string, string, string];
  meaning: string;
  exampleZh: string;
  exampleEn: string;
  story: string;
};

export type DayParts = {
  monthDay: string;
  year: string;
  weekday: string;
};

const WEEKDAYS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'] as const;

export function fnv1a32(text: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < text.length; i += 1) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function asDayKey(value: string): DayKey {
  return value as DayKey;
}

export function parseDayKey(raw: string): DayKey | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(raw);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (
    probe.getUTCFullYear() !== year ||
    probe.getUTCMonth() !== month - 1 ||
    probe.getUTCDate() !== day
  ) {
    return null;
  }
  return asDayKey(`${match[1]}-${match[2]}-${match[3]}`);
}

export function singaporeDayKey(now: Date): DayKey {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Singapore',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now);
  const year = parts.find((part) => part.type === 'year')?.value;
  const month = parts.find((part) => part.type === 'month')?.value;
  const day = parts.find((part) => part.type === 'day')?.value;
  if (!year || !month || !day) throw new Error('Singapore date parts missing');
  const key = parseDayKey(`${year}-${month}-${day}`);
  if (!key) throw new Error('Singapore date was not a calendar day');
  return key;
}

export function resolveDay(query: string | null, now: Date): DayKey {
  if (query) {
    const parsed = parseDayKey(query);
    if (parsed) return parsed;
  }
  return singaporeDayKey(now);
}

function zhNumber(value: number): string {
  const digits = ['〇', '一', '二', '三', '四', '五', '六', '七', '八', '九'];
  if (value <= 10) return value === 10 ? '十' : digits[value];
  if (value < 20) return `十${digits[value - 10]}`;
  const tens = Math.floor(value / 10);
  const ones = value % 10;
  return `${digits[tens]}十${ones === 0 ? '' : digits[ones]}`;
}

export function formatDay(day: DayKey): DayParts {
  const [yearText, monthText, dayText] = day.split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const date = Number(dayText);
  return {
    monthDay: `${zhNumber(month)}月${zhNumber(date)}日`,
    year: String(year),
    weekday: WEEKDAYS[new Date(Date.UTC(year, month - 1, date)).getUTCDay()],
  };
}

function isText(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isQuad(value: unknown): value is [string, string, string, string] {
  return Array.isArray(value) && value.length === 4 && value.every(isText);
}

export function parsePack(raw: unknown): Chengyu[] {
  if (!Array.isArray(raw)) throw new TypeError('pack is not a list');
  const seen = new Set<string>();
  const pack: Chengyu[] = [];
  for (const item of raw) {
    if (!item || typeof item !== 'object') throw new TypeError('pack entry is not an object');
    const row = item as Record<string, unknown>;
    if (!isText(row.id) || !isText(row.simplified) || !isText(row.traditional)) {
      throw new TypeError('pack entry is missing text');
    }
    if (row.id !== row.simplified) throw new TypeError(`id does not match simplified form: ${row.id}`);
    if ([...row.simplified].length !== 4 || [...row.traditional].length !== 4) {
      throw new TypeError(`entry is not four characters: ${row.id}`);
    }
    if (!isQuad(row.pinyin) || !isQuad(row.gloss)) {
      throw new TypeError(`entry needs four readings and glosses: ${row.id}`);
    }
    if (!isText(row.meaning) || !isText(row.exampleZh) || !isText(row.exampleEn) || !isText(row.story)) {
      throw new TypeError(`entry is missing the lesson: ${row.id}`);
    }
    if (seen.has(row.id)) throw new TypeError(`duplicate entry: ${row.id}`);
    seen.add(row.id);
    pack.push({
      id: row.id,
      simplified: row.simplified,
      traditional: row.traditional,
      pinyin: row.pinyin,
      gloss: row.gloss,
      meaning: row.meaning,
      exampleZh: row.exampleZh,
      exampleEn: row.exampleEn,
      story: row.story,
    });
  }
  if (pack.length < 100) throw new TypeError('pack has fewer than 100 idioms');
  pack.sort((left, right) => (left.id < right.id ? -1 : left.id > right.id ? 1 : 0));
  return pack;
}

export function pickChengyu(pack: readonly Chengyu[], day: DayKey): Chengyu {
  if (pack.length === 0) throw new TypeError('pack is empty');
  return pack[fnv1a32(day) % pack.length];
}

export function glyphs(item: Chengyu, script: Script): string {
  return script === 'traditional' ? item.traditional : item.simplified;
}

export function parseScript(raw: string | null): Script {
  return raw === 'traditional' ? 'traditional' : 'simplified';
}

export function screenFromHash(hash: string): Screen {
  return hash === '#detail' ? 'detail' : 'card';
}
