#!/usr/bin/env node
// shoot.mjs — 截图自查：桌面 1440×900 + 手机 390×844，首屏和之后每隔约一屏一张。
// 用法：node shoot.mjs <path/to/index.html> [输出目录，默认同目录下 _shots/]
// 依赖：puppeteer、puppeteer-core 或 playwright 任意一个（npm i -D puppeteer-core），
//       以及本机的 Chrome / Chromium / Edge。
import { existsSync, mkdirSync } from 'node:fs';
import { resolve, dirname, join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const file = process.argv[2];
if (!file) { console.error('用法: node shoot.mjs <index.html> [输出目录]'); process.exit(1); }
const page = resolve(file);
const out = resolve(process.argv[3] || join(dirname(page), '_shots'));
mkdirSync(out, { recursive: true });

const require = createRequire(join(process.cwd(), 'noop.js'));
function tryLoad(name) { try { return require(name); } catch { return null; } }

const browsers = [
  process.env.CHROME_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
  '/Applications/Chromium.app/Contents/MacOS/Chromium',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser',
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
].filter(Boolean);
const executablePath = browsers.find(p => existsSync(p));

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function launch() {
  const pw = tryLoad('playwright');
  if (pw) return { kind: 'pw', browser: await pw.chromium.launch(executablePath ? { executablePath } : {}) };
  const pp = tryLoad('puppeteer') || tryLoad('puppeteer-core');
  if (pp) {
    if (!executablePath && !tryLoad('puppeteer')) throw new Error('找不到 Chrome，请设置环境变量 CHROME_PATH');
    return { kind: 'pp', browser: await pp.launch({ headless: 'new', executablePath, args: ['--no-sandbox'] }) };
  }
  throw new Error('需要安装 puppeteer-core 或 playwright：npm i -D puppeteer-core');
}

const { kind, browser } = await launch();
const errors = [];
for (const [name, w, h, mobile] of [['desktop', 1440, 900, false], ['mobile', 390, 844, true]]) {
  const p = kind === 'pw'
    ? await browser.newPage({ viewport: { width: w, height: h }, isMobile: mobile, hasTouch: mobile })
    : await browser.newPage();
  if (kind === 'pp') await p.setViewport({ width: w, height: h, isMobile: mobile, hasTouch: mobile });
  p.on('pageerror', e => errors.push(`[${name}] ${e}`));
  p.on('console', m => { if (m.type() === 'error') errors.push(`[${name}] console: ${m.text()}`); });
  await p.goto(pathToFileURL(page).href);
  await p.waitForSelector('html.aw-ready', { timeout: 8000 }).catch(() => errors.push(`[${name}] aw-ready 没有出现（JS 是否加载？）`));
  await sleep(3000);
  const total = await p.evaluate(() => document.documentElement.scrollHeight);
  const overflowX = await p.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1);
  if (overflowX) errors.push(`[${name}] 页面有横向溢出（scrollWidth > 视口宽度）`);
  let i = 0;
  for (let y = 0; y < total && i < 14; y += Math.round(h * 1.6), i++) {
    await p.evaluate(y => window.scrollTo(0, y), y);
    await sleep(1100);
    await p.screenshot({ path: join(out, `${name}-${String(i).padStart(2, '0')}.png`) });
  }
  console.log(`${name}: ${i} 张，页面高度 ${total}px`);
  await p.close();
}
await browser.close();
console.log(`截图在 ${out}`);
if (errors.length) { console.log('\n问题：\n' + errors.join('\n')); process.exitCode = 2; }
else console.log('没有发现报错或横向溢出。');
