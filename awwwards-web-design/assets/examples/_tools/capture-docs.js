// capture-docs.js — 从示例页截取使用手册的参考图（每个效果一张）。
// 用法：node capture-docs.js <puppeteer-core 路径> <chrome 路径> <输出目录>
const [, , ppPath, chrome, outDir] = process.argv;
const puppeteer = require(ppPath);
const path = require('path');
const fs = require('fs');
const EX = path.resolve(__dirname, '..');
const sleep = ms => new Promise(r => setTimeout(r, ms));
fs.mkdirSync(outDir, { recursive: true });

async function open(b, page, w = 1440, h = 900) {
  const p = await b.newPage();
  await p.setViewport({ width: w, height: h, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(EX, page));
  await p.waitForSelector('html.aw-ready');
  await sleep(2600);
  return p;
}
const to = (p, sel, block = 'center', dy = 0) => p.evaluate((s, b, dy) => { document.querySelector(s).scrollIntoView({ block: b }); window.scrollBy(0, dy); }, sel, block, dy);
const shot = (p, name) => p.screenshot({ path: path.join(outDir, name + '.jpg'), type: 'jpeg', quality: 80 });
async function vshot(p, name, clip, q = 80) {   // clip 用视口坐标；puppeteer 的 clip 是页面坐标，加上 scrollY
  const sy = await p.evaluate(() => window.scrollY);
  await p.screenshot({ path: path.join(outDir, name + '.jpg'), type: 'jpeg', quality: q, clip: { ...clip, y: clip.y + sy } });
}
async function center(p, sel) { const bb = await (await p.$(sel)).boundingBox(); return [bb.x + bb.width / 2, bb.y + bb.height / 2]; }

(async () => {
  const b = await puppeteer.launch({ executablePath: chrome, headless: 'new', args: ['--no-sandbox'] });

  /* ---------- poster ---------- */
  let p = await open(b, 'poster/index.html');
  await shot(p, 'style-poster');                                    // 首屏 = 风格图 + mega reveal
  await to(p, '.section.grid h2'); await sleep(1800); await shot(p, 'reveal-words');
  await to(p, '.band'); await sleep(1200); await shot(p, 'marquee');
  const pin = await p.evaluate(() => ScrollTrigger.getAll().find(t => t.pin && t.trigger.closest('#programme')).start);
  await p.evaluate(y => window.scrollTo(0, y + innerHeight * 0.9), pin); await sleep(1400); await shot(p, 'steps');
  await to(p, '#schedule', 'start', 200); await sleep(1400); await shot(p, 'clock');
  const hs = await p.evaluate(() => ScrollTrigger.getAll().find(t => t.trigger.id === 'speakers').start);
  await p.evaluate(y => window.scrollTo(0, y + 420), hs); await sleep(1400); await shot(p, 'hscroll');
  await to(p, '.stats'); await sleep(2400);
  await vshot(p, 'counter', { x: 0, y: 200, width: 1440, height: 500 });
  await to(p, '#tickets'); await sleep(1200);
  let [x, y] = await center(p, '.ticket'); await p.mouse.move(x + 60, y - 40); await sleep(500); await shot(p, 'magnetic');
  await p.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight)); await sleep(2200); await shot(p, 'fit-text');
  await p.evaluate(() => window.scrollTo(0, 0)); await sleep(800);
  await p.click('[data-aw="menu"]'); await sleep(1500); await shot(p, 'menu');
  await p.close();

  /* ---------- editorial ---------- */
  p = await open(b, 'editorial/index.html');
  await shot(p, 'style-editorial');
  await vshot(p, 'arc-text', { x: 820, y: 60, width: 620, height: 480 }, 85);                                 // 首屏 = 风格图 + img-reveal + arc-text
  await to(p, '.intro'); await sleep(1800); await shot(p, 'mixed-type');
  await to(p, '.wide figure'); await sleep(1200); await shot(p, 'parallax');
  await to(p, '#coffee', 'start', 80); await sleep(1600); await shot(p, 'theme');
  await to(p, '.origins'); await sleep(1200);
  [x, y] = await center(p, '.origins li:nth-child(2)'); await p.mouse.move(x - 200, y); await sleep(250); await p.mouse.move(x - 180, y); await sleep(900); await shot(p, 'hover-preview');
  await to(p, '#visit'); await sleep(1000);
  [x, y] = await center(p, '#visit .big'); await p.mouse.move(x, y); await sleep(900); await shot(p, 'scribble');
  await p.mouse.move(5, 5); await p.evaluate(() => window.scrollTo(0, 0)); await sleep(1000);
  [x, y] = await center(p, '.corner--tr a:nth-child(2)'); await p.mouse.move(x, y); await sleep(800);
  await vshot(p, 'hover-swap', { x: 1100, y: 0, width: 340, height: 90 }, 85);
  await p.close();

  /* ---------- showcase ---------- */
  p = await open(b, 'showcase/index.html');
  await p.mouse.move(900, 560); await sleep(900);
  await shot(p, 'style-showcase');
  await shot(p, 'float-cards');
  const stOf = sel => p.evaluate(s => { const t = ScrollTrigger.getAll().find(t => t.trigger.matches(s)); return [t.start, t.end]; }, sel);
  let r = await stOf('.ink');
  await p.evaluate(y => window.scrollTo(0, y), r[0] + (r[1] - r[0]) * 0.55); await sleep(1000); await shot(p, 'ink-reveal');
  r = await stOf('#shelf');
  await p.evaluate(y => window.scrollTo(0, y), r[0] + (r[1] - r[0]) * 0.4); await sleep(2200); await shot(p, 'disc-carousel');
  await p.evaluate(y => window.scrollTo(0, y), r[0] + (r[1] - r[0]) * 0.5); await sleep(400);  // 转动中的一帧
  await vshot(p, 'rotate', { x: 300, y: 120, width: 1000, height: 700 }, 82);
  await p.evaluate(() => document.getElementById('vessels').scrollIntoView()); await p.mouse.move(5, 5); await sleep(4300);
  await shot(p, 'outfit-switch');
  await p.close();

  /* ---------- pets（白底商品图 + outfit-switch data-aw-blend） ---------- */
  p = await open(b, 'pets/index.html');
  await p.mouse.move(5, 895); await sleep(4200);
  await shot(p, 'example-pets');
  await p.close();

  /* ---------- 单独测试页里的模块 ---------- */
  p = await open(b, '../starter/demo/modules-test.html');
  await to(p, '#t-odo', 'start', -60); await sleep(1200);
  await vshot(p, 'odometer', { x: 0, y: 0, width: 1440, height: 560 });
  await p.close();
  p = await open(b, '../starter/demo/modules-test-2.html');
  await shot(p, 'hero-cycle');
  await to(p, '#t-dot'); await sleep(600);
  [x, y] = await center(p, '#t-dot canvas'); await p.mouse.move(x - 120, y); await sleep(200); await p.mouse.move(x - 60, y + 20); await sleep(120); await shot(p, 'dot-matrix');
  await to(p, '#t-drag'); await sleep(600); await shot(p, 'drag-gallery');
  await p.close();

  await b.close();
  console.log(fs.readdirSync(outDir).join(' '));
})();
