/*!
 * outfit-switch — 商品换装轮播：主角居中，后面几套在左侧排队渐小渐糊，右侧配件栏随之上滑替换
 * 用法：
 *   <section data-aw="outfit-switch" data-aw-interval="3.2">
 *     <article class="aw-look">
 *       <h3>Midnight Magic</h3>                         套装名，显示在左上
 *       <img src="look-1.png" alt="…">                   主角图：透明底 PNG 最佳
 *       <ul><li><img src="hat.png" alt=""><span>Wizard hat</span></li>…</ul>   右侧配件 2–4 件
 *     </article>
 *     …（3–8 套）
 *   </section>
 *   data-aw-interval="3.2"  自动切换秒数，0 = 不自动切换
 *   data-aw-queue="3"       左侧排队显示几套
 * 点击左侧排队的套装直接切到它；键盘 ← → 切换；鼠标悬停时暂停自动切换；离开视口时暂停。
 * 区块高度用 CSS 变量 --look-h 调（默认 min(78vh, 760px)）。
 */
AW.register('outfit-switch', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var looks = [].slice.call(el.querySelectorAll('.aw-look'));
  var n = looks.length;
  if (n < 2) return;
  var interval = o.interval != null ? o.interval : 3.2;
  var queue = o.queue != null ? o.queue : 3;
  var dur = ctx.reduced ? 0 : 1.1;

  if (!document.getElementById('aw-outfit-style')) {
    var css = document.createElement('style');
    css.id = 'aw-outfit-style';
    css.textContent =
      '[data-aw~="outfit-switch"]{position:relative;height:var(--look-h,min(78vh,760px));overflow:hidden;outline:none}' +
      '.aw-os-title{position:absolute;left:0;top:0;right:24%;z-index:20;height:1.3em;overflow:hidden;margin:0;font:600 clamp(22px,2.4vw,40px)/1.2 var(--font-body,sans-serif);letter-spacing:-0.02em}' +
      '.aw-os-title>*{position:absolute;left:0;top:0;margin:0;font:inherit;white-space:nowrap}' +
      '.aw-os-stage{position:absolute;left:0;right:22%;top:12%;bottom:4%}' +
      '.aw-os-hero{position:absolute;left:52%;bottom:0;height:92%;width:auto;max-width:none;transform-origin:50% 100%;cursor:pointer;will-change:transform,filter}' +
      '.aw-os-side{position:absolute;right:0;top:8%;bottom:0;width:18%;overflow:hidden}' +
      '.aw-os-side>ul{position:absolute;inset:0;list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:clamp(12px,3vh,32px)}' +
      '.aw-os-side li{display:flex;flex-direction:column;align-items:center;gap:6px;font-size:var(--fs-meta,12px);color:var(--muted,#777)}' +
      '.aw-os-side img{width:min(100%,140px);aspect-ratio:1;object-fit:contain}' +
      '@media (max-width:767px){.aw-os-stage{right:0;top:14%;bottom:24%}.aw-os-hero{left:38%;height:80%}.aw-os-side{top:auto;height:22%;width:100%}' +
        '.aw-os-side>ul{flex-direction:row;justify-content:center}.aw-os-side img{width:64px}}';
    document.head.appendChild(css);
  }

  var originalHTML = el.innerHTML;
  var hadTabindex = el.hasAttribute('tabindex');

  var title = document.createElement('div');
  var stage = document.createElement('div');
  var side = document.createElement('div');
  title.className = 'aw-os-title';
  stage.className = 'aw-os-stage';
  side.className = 'aw-os-side';
  title.setAttribute('aria-live', 'polite');

  var parts = looks.map(function (look) {
    var name = look.querySelector('h1,h2,h3,h4,h5,h6');
    var hero = look.querySelector(':scope > img');
    var items = look.querySelector(':scope > ul');
    if (hero) { hero.classList.add('aw-os-hero'); stage.appendChild(hero); }
    if (name) title.appendChild(name);
    if (items) side.appendChild(items);
    return { name: name, hero: hero, items: items };
  });
  looks.forEach(function (l) { l.remove(); });
  el.appendChild(title);
  el.appendChild(stage);
  el.appendChild(side);
  if (!hadTabindex) el.setAttribute('tabindex', '0');

  /* d：0 = 当前；1..queue = 左侧排队；-1 = 刚离开（向右放大淡出） */
  function slot(d) {
    var w = stage.offsetWidth;
    if (d === 0) return { x: 0, scale: 1, blur: 0, opacity: 1, z: 50 };
    if (d < 0) return { x: w * 0.42, scale: 1.12, blur: 0, opacity: 0, z: 60 };
    if (d > queue) return { x: -w * (0.3 + queue * 0.17), scale: 0.3, blur: 14, opacity: 0, z: 1 };
    return {
      x: -w * (0.2 + d * 0.12),
      scale: Math.max(0.3, 0.66 - (d - 1) * 0.11),
      blur: d === 1 ? 0 : (d - 1) * 5,
      opacity: d === 1 ? 1 : Math.max(0.35, 1 - (d - 1) * 0.28),
      z: 50 - d
    };
  }

  function rel(i, cur) { var d = (i - cur + n) % n; return d === n - 1 && n > 2 ? -1 : d; }

  var current = 0;
  function place(cur, animate) {
    parts.forEach(function (p, i) {
      if (!p.hero) return;
      var s = slot(rel(i, cur));
      var vars = { x: s.x, scale: s.scale, autoAlpha: s.opacity, filter: 'blur(' + s.blur + 'px)', zIndex: s.z };
      /* 从左侧最远处重新进入队列的那张不要横穿画面 */
      if (animate && rel(i, cur) === Math.min(queue, n - 2) && rel(i, (cur - 1 + n) % n) === -1) {
        gsap.set(p.hero, slot(queue + 1));
      }
      if (animate) gsap.to(p.hero, Object.assign(vars, { duration: dur, ease: 'expo.inOut', overwrite: true }));
      else gsap.set(p.hero, vars);
    });
  }

  function show(next) {
    next = (next + n) % n;
    if (next === current) return;
    var prev = parts[current], cur = parts[next];
    if (prev.name) gsap.to(prev.name, { yPercent: -110, duration: dur * 0.6, ease: 'power3.in', overwrite: true });
    if (cur.name) gsap.fromTo(cur.name, { yPercent: 110 }, { yPercent: 0, duration: dur * 0.8, delay: dur * 0.35, ease: 'expo.out', overwrite: true });
    if (prev.items) gsap.to(prev.items.children, { yPercent: -160, autoAlpha: 0, duration: dur * 0.6, stagger: 0.06, ease: 'power3.in', overwrite: true });
    if (cur.items) {
      gsap.set(cur.items, { autoAlpha: 1 });
      gsap.fromTo(cur.items.children, { yPercent: 160, autoAlpha: 0 }, {
        yPercent: 0, autoAlpha: 1, duration: dur * 0.9, delay: dur * 0.3, stagger: 0.08, ease: 'expo.out', overwrite: true
      });
    }
    current = next;
    place(current, true);
    restart();
  }

  /* 初始状态 */
  parts.forEach(function (p, i) {
    if (p.name) gsap.set(p.name, { yPercent: i === 0 ? 0 : 110 });
    if (p.items) gsap.set(p.items, { autoAlpha: i === 0 ? 1 : 0 });
  });
  place(0, false);

  var timer = null, hovering = false, visible = true;
  function restart() {
    if (timer) timer.kill();
    timer = null;
    if (!interval || ctx.reduced || hovering || !visible) return;
    timer = gsap.delayedCall(interval, function () { show(current + 1); });
  }

  function onClick(e) {
    var img = e.target.closest('.aw-os-hero');
    if (!img) return;
    var i = parts.findIndex(function (p) { return p.hero === img; });
    if (i >= 0 && i !== current) show(i);
  }
  function onKey(e) {
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
  }
  function onEnter() { hovering = true; restart(); }
  function onLeave() { hovering = false; restart(); }
  function onResize() { place(current, false); }

  stage.addEventListener('click', onClick);
  el.addEventListener('keydown', onKey);
  el.addEventListener('mouseenter', onEnter);
  el.addEventListener('mouseleave', onLeave);
  window.addEventListener('resize', onResize);

  var io = new IntersectionObserver(function (en) { visible = en[0].isIntersecting; restart(); });
  io.observe(el);

  return function () {
    if (timer) timer.kill();
    io.disconnect();
    stage.removeEventListener('click', onClick);
    el.removeEventListener('keydown', onKey);
    el.removeEventListener('mouseenter', onEnter);
    el.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('resize', onResize);
    el.innerHTML = originalHTML;
    if (!hadTabindex) el.removeAttribute('tabindex');
  };
});
