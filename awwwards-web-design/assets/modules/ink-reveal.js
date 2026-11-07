/*!
 * ink-reveal — 墨水晕开转场：钉住一屏，下一章节像一滴墨从中间晕开，边缘不规则、带水彩深边，直到铺满画面
 * 用法：
 *   <div data-aw="ink-reveal">
 *     <section class="aw-ink-from">上一章（通常深色）</section>
 *     <section class="aw-ink-to">下一章（墨水的颜色就是它的背景色）</section>
 *   </div>
 *   data-aw-length="120"  晕开过程占用的滚动距离（vh）
 *   data-aw-x="0.5"       晕开起点，横向 0–1
 *   data-aw-y="0.55"      晕开起点，纵向 0–1
 *   data-aw-rough="1"     边缘粗糙程度，0 = 正圆
 *   data-aw-rim="rgba(0,0,0,.18)"  内侧深边颜色，none = 不要深边
 *   data-aw-seed="2"      随机种子，换数字换一种墨迹形状
 * 两层都是 100vh；to 层的内容在墨迹铺满前就已在原位，跟着墨迹一起露出来。减少动效时两层上下排列、不做转场。
 */
AW.register('ink-reveal', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var from = el.querySelector('.aw-ink-from');
  var to = el.querySelector('.aw-ink-to');
  if (!from || !to || ctx.reduced) return;

  var NS = 'http://www.w3.org/2000/svg';
  var length = o.length != null ? o.length : 120;
  var ox = o.x != null ? o.x : 0.5;
  var oy = o.y != null ? o.y : 0.55;
  var rough = o.rough != null ? o.rough : 1;
  var rim = o.rim || 'rgba(0,0,0,.18)';
  var styles = { el: el.getAttribute('style'), from: from.getAttribute('style'), to: to.getAttribute('style') };

  el.style.position = 'relative';
  el.style.height = '100vh';
  el.style.overflow = 'hidden';
  [from, to].forEach(function (s) {
    s.style.position = 'absolute';
    s.style.inset = '0';
    s.style.height = '100%';
  });
  to.style.zIndex = '2';
  to.style.willChange = 'clip-path';

  /* 深边：同一条路径描粗边再模糊，只留在墨迹内侧（to 层自身被裁切） */
  var svg = null, rimPath = null;
  if (rim !== 'none') {
    svg = document.createElementNS(NS, 'svg');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;max-width:none;pointer-events:none;z-index:1;overflow:visible';
    var fid = 'aw-ink-blur-' + Math.random().toString(36).slice(2, 7);
    svg.innerHTML = '<defs><filter id="' + fid + '" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="14"/></filter></defs>';
    rimPath = document.createElementNS(NS, 'path');
    rimPath.setAttribute('fill', 'none');
    rimPath.setAttribute('stroke', rim);
    rimPath.setAttribute('stroke-width', '46');
    rimPath.setAttribute('filter', 'url(#' + fid + ')');
    svg.appendChild(rimPath);
    to.appendChild(svg);
  }

  /* 墨迹轮廓：极坐标，半径叠加几层不同频率的正弦（相位随种子），粗糙度随半径增大 */
  var seed = (o.seed != null ? o.seed : 2) * 7919 + 3;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  var waves = [];
  for (var k = 0; k < 9; k++) {
    waves.push({ f: [2, 3, 5, 7, 11, 17, 29, 43, 61][k], a: [0.09, 0.07, 0.05, 0.035, 0.025, 0.018, 0.014, 0.01, 0.008][k], p: rnd() * 6.283, drift: (rnd() - 0.5) * 1.2 });
  }
  var STEPS = 260;

  function shape(p) {
    var w = el.offsetWidth, h = el.offsetHeight;
    var cx = w * ox, cy = h * oy;
    var far = Math.max(Math.hypot(cx, cy), Math.hypot(w - cx, cy), Math.hypot(cx, h - cy), Math.hypot(w - cx, h - cy));
    /* 前段慢慢渗开、后段加速铺满；1.3 倍是为了让最凹的边缘也盖过角落 */
    var e = Math.pow(p, 1.6);
    var R = e * far * 1.3;
    if (R < 0.5) return '';
    var d = '';
    for (var i = 0; i <= STEPS; i++) {
      var a = i / STEPS * 6.283;
      var n = 0;
      for (var j = 0; j < waves.length; j++) {
        var wv = waves[j];
        n += Math.sin(a * wv.f + wv.p + p * wv.drift * 6) * wv.a;
      }
      var r = R * (1 + n * rough * (0.6 + p));
      d += (i ? 'L' : 'M') + (cx + Math.cos(a) * r).toFixed(1) + ' ' + (cy + Math.sin(a) * r * 0.92).toFixed(1);
    }
    return d + 'Z';
  }

  function render(p) {
    if (p >= 1) { to.style.clipPath = 'none'; if (rimPath) rimPath.setAttribute('d', ''); return; }
    var d = shape(p);
    to.style.clipPath = d ? "path('" + d + "')" : 'inset(50%)';
    if (rimPath) rimPath.setAttribute('d', d);
  }
  render(0);

  var st = ctx.ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: function () { return '+=' + window.innerHeight * length / 100; },
    pin: true,
    scrub: true,
    invalidateOnRefresh: true,
    onUpdate: function (self) { render(self.progress); },
    onRefresh: function (self) { render(self.progress); }
  });

  return function () {
    st.kill();
    if (svg) svg.remove();
    [['el', el], ['from', from], ['to', to]].forEach(function (pair) {
      var v = styles[pair[0]];
      if (v == null) pair[1].removeAttribute('style'); else pair[1].setAttribute('style', v);
    });
  };
});
