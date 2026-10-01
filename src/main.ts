import packRaw from './pack.json';
import {
  formatDay,
  glyphs,
  parsePack,
  parseScript,
  pickChengyu,
  resolveDay,
  screenFromHash,
  type Chengyu,
  type DayParts,
  type Screen,
  type Script,
} from './domain';

const pack = parsePack(packRaw);
const found = document.querySelector('#app');
if (!(found instanceof HTMLElement)) throw new Error('missing #app');
const app: HTMLElement = found;

const SCRIPT_KEY = 'chengyu-script';

let script: Script = parseScript(localStorage.getItem(SCRIPT_KEY));
let screen: Screen = screenFromHash(location.hash);

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className?: string,
  text?: string,
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function dayNow() {
  return resolveDay(new URLSearchParams(location.search).get('day'), new Date());
}

function scriptButton(): HTMLButtonElement {
  const button = el('button', 'script', script === 'simplified' ? '繁' : '简');
  button.type = 'button';
  button.dataset.action = 'script';
  button.setAttribute('aria-label', script === 'simplified' ? '切换为繁体' : '切换为简体');
  return button;
}

function mast(parts: DayParts): HTMLElement {
  const header = el('header', 'mast');
  header.append(
    el('p', 'side', parts.monthDay),
    el('p', 'year', parts.year),
    el('p', 'side', parts.weekday),
  );
  return header;
}

function hero(item: Chengyu): HTMLHeadingElement {
  const title = el('h1', 'hero', glyphs(item, script));
  title.lang = script === 'traditional' ? 'zh-Hant' : 'zh-Hans';
  return title;
}

function cells(item: Chengyu): HTMLElement {
  const row = el('div', 'cells');
  const chars = [...glyphs(item, script)];
  chars.forEach((char, index) => {
    const cell = el('div', 'cell');
    const reading = el('p', 'py', item.pinyin[index]);
    const glyph = el('p', 'ch', char);
    glyph.lang = script === 'traditional' ? 'zh-Hant' : 'zh-Hans';
    const gloss = el('p', 'gl', item.gloss[index]);
    cell.append(reading, glyph, gloss);
    row.append(cell);
  });
  return row;
}

function lesson(item: Chengyu): HTMLElement {
  const block = el('div', 'lesson');
  const exampleZh =
    script === 'traditional' ? item.exampleZh.replaceAll(item.simplified, item.traditional) : item.exampleZh;
  const blocks: Array<[string, string, string?]> = [
    ['Meaning', item.meaning],
    ['Example', exampleZh, item.exampleEn],
    ['Story', item.story],
  ];
  for (const [label, primary, secondary] of blocks) {
    const section = el('section', 'block');
    section.append(el('h2', 'label', label));
    const zh = el('p', label === 'Example' ? 'zh' : 'copy', primary);
    if (label === 'Example') zh.lang = script === 'traditional' ? 'zh-Hant' : 'zh-Hans';
    section.append(zh);
    if (secondary) section.append(el('p', 'copy', secondary));
    block.append(section);
  }
  return block;
}

function render(tear = false): void {
  const item = pickChengyu(pack, dayNow());
  const parts = formatDay(dayNow());
  document.title = `${glyphs(item, script)} · 成语日历`;

  const pad = el('div', 'pad');
  const sheet = el('article', `sheet${screen === 'detail' ? ' is-detail' : ''}${tear ? ' tear' : ''}`);
  const frame = el('div', 'frame');
  frame.append(mast(parts), scriptButton());

  if (screen === 'card') {
    const tearButton = el('button', 'tear-hit');
    tearButton.type = 'button';
    tearButton.dataset.action = 'open';
    tearButton.append(hero(item), cells(item), el('p', 'hint', '轻触撕开'));
    frame.append(tearButton);
  } else {
    frame.append(hero(item), lesson(item));
    const back = el('button', 'back', '回到今日');
    back.type = 'button';
    back.dataset.action = 'back';
    frame.append(back);
  }

  sheet.append(frame);
  pad.append(sheet);
  app.replaceChildren(pad);

  if (screen === 'detail') {
    const back = frame.querySelector<HTMLButtonElement>('.back');
    back?.focus();
  }
}

function openDetail(): void {
  if (screen === 'detail') return;
  screen = 'detail';
  history.pushState({ screen }, '', `${location.pathname}${location.search}#detail`);
  render(true);
}

function stateScreen(state: unknown): Screen | null {
  if (!state || typeof state !== 'object' || !('screen' in state)) return null;
  const value = state.screen;
  return value === 'card' || value === 'detail' ? value : null;
}

function closeDetail(): void {
  if (stateScreen(history.state) === 'detail') {
    history.back();
    return;
  }
  screen = 'card';
  history.replaceState({ screen }, '', `${location.pathname}${location.search}`);
  render();
}

function toggleScript(): void {
  script = script === 'simplified' ? 'traditional' : 'simplified';
  localStorage.setItem(SCRIPT_KEY, script);
  render();
}

app.addEventListener('click', (event) => {
  const target = event.target;
  if (!(target instanceof Element)) return;
  const action = target.closest<HTMLElement>('[data-action]')?.dataset.action;
  if (action === 'script') toggleScript();
  else if (action === 'open') openDetail();
  else if (action === 'back') closeDetail();
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && screen === 'detail') closeDetail();
});

window.addEventListener('popstate', () => {
  screen = screenFromHash(location.hash);
  render();
});

history.replaceState({ screen }, '', location.href);
render();

if (import.meta.env.PROD && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((error: unknown) => {
      console.error('service worker registration failed', error);
    });
  });
}
