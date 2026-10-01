# Chengyu Calendar

A daily 成语 tear-off for the Oppo Find N3. At midnight in Singapore the page picks one idiom from the pack on the phone. The same date keeps that idiom, with no network after the first load.

## Run the calendar

```
npm install
npm test
npm run dev
```

`npm run build` writes the static site to `dist`.

## Add the calendar to the Find N3 home screen

Install the site over HTTPS before you add it. Chrome does not offer install for a file on the phone.

In Chrome:

1. Open the calendar.
2. Tap the three-dot menu.
3. Tap **Add to Home screen**. If that row says **Install app**, tap that instead.
4. Keep the name **成语** and confirm.
5. Open the new icon. The calendar fills the screen, without the browser bar.

In the preinstalled browser:

1. Open the calendar.
2. Open the menu.
3. Tap **添加到桌面**.
4. Confirm.

If no icon appears, ColorOS blocked the shortcut. On ColorOS 12, 13, or 14, open **Settings**, then **权限与隐私**, then **权限管理**, then **创建桌面快捷方式**, and allow it for the browser you used. On ColorOS 15 the same switch is under **Settings**, then **隐私**, then **权限管理**. Return to the browser and add the page again.

## Open one day

Add `?day=2026-10-01` to the address. The value is a calendar date. A value that is not a real date falls back to today in Singapore. `#detail` opens the meaning, the example, and the story. **繁** on the sheet switches the four characters to traditional.

`src/pack.json` holds 125 idioms. `parsePack` sorts them, and the day hash picks `hash % length`. Adding an idiom changes which later day lands on which entry.

Pinyin and traditional characters were checked against CC-CEDICT (CC BY-SA 4.0). The English glosses, meanings, examples, and stories are original. The Chinese type is a subset of Noto Serif SC under the SIL Open Font License. The license text is `public/fonts/OFL.txt`.
