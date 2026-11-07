/*!
 * disc-carousel — 钉住区块，一排倾斜的光盘随滚动斜向滚过并自转，当前光盘被手绘圈线圈住
 * 用法：
 *   <section data-aw="disc-carousel">
 *     <div class="aw-disc-info"></div>                       可选：左上角信息区，自动放入每张盘的 meta
 *     <a class="aw-disc" href="/film-a">
 *       <img src="cover-a.jpg" alt="Film A">                 盘面：一张方图，或任意 HTML
 *       <div class="aw-disc-meta"><h3>FILM A</h3>…</div>     可选：当前盘时显示在信息区
 *     </a>
 *     …
 *   </section>
 *   data-aw-step="55"     每张盘占用的滚动距离（vh）
 *   data-aw-spin="0.35"   每切换一张盘，盘面自转的圈数
 *   data-aw-tilt-x="16"   盘面前后倾角（度）
 *   data-aw-tilt-y="-34"  盘面左右倾角（度），负数朝左
 *   data-aw-color="var(--ink)" 圈线颜色
 *   data-aw-stroke="0.28" 圈线粗细（相对盘面，0.28 ≈ 2px）
 * 当前盘变化时在 section 上派发 aw:disc 事件，e.detail = { index, disc }，可用来同步页面其他文字。
 * 滚动停下时吸附到最近一张；点侧边的盘会滚到它，点当前盘才打开链接。盘的尺寸用 CSS 变量 --disc-size 调。
 */
AW.register('disc-carousel', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var NS = 'http://www.w3.org/2000/svg';
  var discs = [].slice.call(el.querySelectorAll('.aw-disc'));
  var n = discs.length;
  if (!n) return;

  var step = o.step != null ? o.step : 55;
  var spin = ctx.reduced ? 0 : (o.spin != null ? o.spin : 0.35);
  var tiltX = o.tiltX != null ? o.tiltX : 16;
  var tiltY = o.tiltY != null ? o.tiltY : -34;
  var info = el.querySelector('.aw-disc-info');

  if (!document.getElementById('aw-disc-style')) {
    var css = document.createElement('style');
    css.id = 'aw-disc-style';
    css.textContent =
      '[data-aw~="disc-carousel"]{position:relative;height:100vh;overflow:hidden;--disc-size:min(44vw,64vh)}' +
      '.aw-disc{position:absolute;left:58%;top:52%;width:var(--disc-size);height:var(--disc-size);margin:calc(var(--disc-size)/-2) 0 0 calc(var(--disc-size)/-2);perspective:1400px;display:block;color:inherit;text-decoration:none;will-change:transform}' +
      '.aw-disc-tilt{position:absolute;inset:0;transform-style:preserve-3d}' +
      '.aw-disc-face{position:absolute;inset:0;border-radius:50%;overflow:hidden;background:#222;' +
        '-webkit-mask:radial-gradient(circle,transparent 7.5%,#000 7.8%);mask:radial-gradient(circle,transparent 7.5%,#000 7.8%);' +
        'box-shadow:inset 0 0 0 1px rgba(255,255,255,.25)}' +
      '.aw-disc-face>img{width:100%;height:100%;object-fit:cover;display:block}' +
      /* 光盘反光 + 中心透明圈 */
      '.aw-disc-face::before{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;z-index:2;mix-blend-mode:screen;' +
        'background:conic-gradient(from 30deg,transparent 0 8%,rgba(255,255,255,.35) 14%,transparent 22% 55%,rgba(255,255,255,.25) 62%,transparent 70%)}' +
      '.aw-disc-face::after{content:"";position:absolute;inset:0;border-radius:50%;pointer-events:none;z-index:3;' +
        'background:radial-gradient(circle,rgba(235,235,235,.95) 0 15%,rgba(160,160,160,.9) 15.6%,rgba(240,240,240,.85) 16.5% 19%,transparent 19.5%)}' +
      '.aw-disc-ring{transform:translateZ(1px);position:absolute;max-width:none;left:-12%;top:-12%;width:124%;height:124%;overflow:visible;pointer-events:none}' +
      '.aw-disc-meta{position:absolute;left:0;top:0;width:100%;visibility:hidden}' +
      '.aw-disc>.aw-disc-meta{display:none}' +
      '.aw-disc-info{position:absolute;z-index:200;left:var(--margin,24px);top:calc(var(--margin,24px) + 3.5em);width:min(340px,40vw)}' +
      '@media (max-width:767px){[data-aw~="disc-carousel"]{--disc-size:72vw}.aw-disc{left:55%;top:58%}.aw-disc-info{width:calc(100% - 2*var(--margin,16px))}}';
    document.head.appendChild(css);
  }

  /* 记录原始结构，cleanup 时还原 */
  var originals = discs.map(function (d) { return { el: d, html: d.innerHTML, style: d.getAttribute('style') }; });
  var infoHTML = info ? info.innerHTML : null;

  var parts = discs.map(function (d, i) {
    var meta = d.querySelector('.aw-disc-meta');
    var tilt = document.createElement('div');
    var face = document.createElement('div');
    tilt.className = 'aw-disc-tilt';
    face.className = 'aw-disc-face';
    while (d.firstChild) {
      if (d.firstChild === meta) d.removeChild(meta);
      else face.appendChild(d.firstChild);
    }
    tilt.appendChild(face);
    var ring = makeRing(i);
    tilt.appendChild(ring.svg);
    d.appendChild(tilt);
    if (meta && info) info.appendChild(meta);
    gsap.set(tilt, { rotationX: tiltX, rotationY: tiltY });
    return { tilt: tilt, face: face, ring: ring, meta: meta && info ? meta : null };
  });

  /* 手绘圈：绕 1.15 圈、半径带轻微抖动的闭合线，每张盘形状不同 */
  function makeRing(seed) {
    var svg = document.createElementNS(NS, 'svg');
    var path = document.createElementNS(NS, 'path');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('class', 'aw-disc-ring');
    svg.setAttribute('aria-hidden', 'true');
    var pts = [], k = 72, turns = 1.15, a0 = -1.9 + seed * 0.7;
    for (var j = 0; j <= k; j++) {
      var t = j / k, a = a0 + t * turns * Math.PI * 2;
      var r = 45 + Math.sin(a * 3 + seed) * 1.1 + Math.sin(a * 5 + seed * 2.3) * 0.6 + t * 2.2;
      pts.push((50 + Math.cos(a) * r * 1.02).toFixed(2) + ' ' + (50 + Math.sin(a) * r).toFixed(2));
    }
    path.setAttribute('d', 'M' + pts.join(' L'));
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke', o.color || 'var(--ink)');
    path.setAttribute('stroke-linecap', 'round');
    path.setAttribute('stroke-linejoin', 'round');
    path.setAttribute('stroke-width', o.stroke != null ? o.stroke : 0.28);
    svg.appendChild(path);
    return { svg: svg, path: path, len: 0 };
  }

  /* SVG 进入文档后才能量长度 */
  parts.forEach(function (p) {
    p.ring.len = p.ring.path.getTotalLength() + 2;
    gsap.set(p.ring.path, { strokeDasharray: p.ring.len, strokeDashoffset: p.ring.len });
  });

  var active = -1;
  function setActive(i) {
    if (i === active) return;
    var prev = active;
    active = i;
    if (prev >= 0) {
      var pp = parts[prev];
      gsap.to(pp.ring.path, { strokeDashoffset: -pp.ring.len, duration: ctx.reduced ? 0 : 0.45, ease: 'power2.in', overwrite: true });
      if (pp.meta) gsap.to(pp.meta, { autoAlpha: 0, y: -12, duration: ctx.reduced ? 0 : 0.35, ease: 'power2.in', overwrite: true });
    }
    var p = parts[i];
    el.dispatchEvent(new CustomEvent('aw:disc', { detail: { index: i, disc: discs[i] } }));
    gsap.fromTo(p.ring.path, { strokeDashoffset: p.ring.len }, {
      strokeDashoffset: 0, duration: ctx.reduced ? 0 : 0.9, delay: ctx.reduced ? 0 : 0.25, ease: 'power2.out', overwrite: true
    });
    if (p.meta) gsap.fromTo(p.meta, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: ctx.reduced ? 0 : 0.6, delay: ctx.reduced ? 0 : 0.15, ease: 'expo.out', overwrite: true });
  }

  /* d = 盘相对当前位置的序号差：负数在左下（更小、更远），正数在右上（更大、出画） */
  function render(pos) {
    var size = discs[0].offsetWidth;
    discs.forEach(function (d, i) {
      var dd = i - pos;
      var ad = Math.abs(dd);
      var scale = Math.max(0.25, dd < 0 ? 1 + dd * 0.17 : 1 + dd * 0.12);
      var x = dd < 0 ? dd * size * (0.62 - Math.min(ad, 3) * 0.05) : dd * size * 0.82;
      var y = -dd * size * 0.2;
      gsap.set(d, {
        x: x, y: y, scale: scale,
        zIndex: 100 - Math.round(ad * 10),
        autoAlpha: dd < -3.6 || dd > 1.8 ? 0 : 1
      });
      gsap.set(parts[i].face, { rotation: dd * spin * -360 });
    });
    setActive(Math.max(0, Math.min(n - 1, Math.round(pos))));
  }

  var proxy = { pos: 0 };
  var tween = null;
  render(0);

  if (n > 1) {
    tween = gsap.to(proxy, {
      pos: n - 1,
      ease: 'none',
      onUpdate: function () { render(proxy.pos); },
      scrollTrigger: {
        trigger: el,
        start: 'top top',
        end: function () { return '+=' + (n - 1) * window.innerHeight * step / 100; },
        pin: true,
        scrub: ctx.reduced ? true : 0.8,
        snap: { snapTo: 1 / (n - 1), inertia: false, duration: { min: 0.25, max: 0.7 }, delay: 0.08, ease: 'power2.inOut' },
        invalidateOnRefresh: true
      }
    });
  }

  function onClick(e) {
    var i = discs.indexOf(e.currentTarget);
    if (i === active || !tween) return;
    e.preventDefault();
    var st = tween.scrollTrigger;
    var y = st.start + (st.end - st.start) * i / (n - 1);
    if (ctx.lenis) ctx.lenis.scrollTo(y, { duration: 1.2 });
    else window.scrollTo({ top: y, behavior: ctx.reduced ? 'auto' : 'smooth' });
  }
  discs.forEach(function (d) { d.addEventListener('click', onClick); });

  return function () {
    discs.forEach(function (d) { d.removeEventListener('click', onClick); });
    if (tween) { if (tween.scrollTrigger) tween.scrollTrigger.kill(); tween.kill(); }
    originals.forEach(function (r) {
      r.el.innerHTML = r.html;
      if (r.style == null) r.el.removeAttribute('style'); else r.el.setAttribute('style', r.style);
    });
    if (info) info.innerHTML = infoHTML;
  };
});
