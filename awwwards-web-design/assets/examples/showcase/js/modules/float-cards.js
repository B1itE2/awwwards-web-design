/*!
 * float-cards — 一组卡片悬浮在 3D 空间里缓慢漂动，鼠标带动景深视差，往下滚时卡片朝镜头飞散
 * 用法：
 *   <div data-aw="float-cards">
 *     <div class="aw-float">卡片内容（图片或 HTML）</div>
 *     …（6–16 张）
 *   </div>
 *   data-aw-spread="1"    分布范围倍数
 *   data-aw-depth="600"   景深范围（px），越大前后层次越明显
 *   data-aw-mouse="1"     鼠标视差强度，0 = 关闭
 *   data-aw-scatter="1"   滚过区块时朝镜头飞散的强度，0 = 关闭
 *   data-aw-seed="3"      随机种子；换数字得到另一种摆法
 * 卡片尺寸由你的 CSS 决定；给单张卡加 data-aw-x / data-aw-y（-1~1）、data-aw-z（-1~1）可手动定位。
 */
AW.register('float-cards', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var cards = [].slice.call(el.querySelectorAll('.aw-float'));
  if (!cards.length) return;
  var spread = o.spread != null ? o.spread : 1;
  var depth = o.depth != null ? o.depth : 600;
  var mouse = ctx.isMobile ? 0 : (o.mouse != null ? o.mouse : 1);
  var scatter = o.scatter != null ? o.scatter : 1;

  /* 可复现的伪随机 */
  var seed = (o.seed != null ? o.seed : 3) * 9973 + 1;
  function rnd() { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }
  function range(a, b) { return a + (b - a) * rnd(); }

  var elStyle = el.getAttribute('style');
  el.style.perspective = el.style.perspective || '1200px';
  if (getComputedStyle(el).position === 'static') el.style.position = 'relative';

  var layer = document.createElement('div');
  layer.style.cssText = 'position:absolute;inset:0;transform-style:preserve-3d;pointer-events:none';
  cards.forEach(function (c) { layer.appendChild(c); });
  el.appendChild(layer);

  var tweens = [];
  var data = cards.map(function (c, i) {
    /* 黄金角分布：不扎堆、不留大洞 */
    var a = i * 2.39996, r = Math.sqrt((i + 0.5) / cards.length);
    var d = {
      x: c.dataset.awX != null ? +c.dataset.awX : Math.cos(a) * r * 0.9 * spread,
      y: c.dataset.awY != null ? +c.dataset.awY : Math.sin(a) * r * 0.75 * spread,
      z: c.dataset.awZ != null ? +c.dataset.awZ : range(-1, 1),
      rx: range(-25, 25), ry: range(-35, 35), rz: range(-14, 14)
    };
    c.style.position = 'absolute';
    c.style.left = '50%';
    c.style.top = '50%';
    c.style.pointerEvents = 'auto';
    c.style.willChange = 'transform';
    gsap.set(c, { xPercent: -50, yPercent: -50, rotationX: d.rx, rotationY: d.ry, rotationZ: d.rz });

    /* 外层位置由本模块每帧写入；漂动用独立的代理值，互不覆盖 */
    d.bob = { y: 0, r: 0 };
    if (!ctx.reduced) {
      tweens.push(gsap.to(d.bob, { y: range(14, 30), duration: range(2.6, 4.2), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -range(0, 4) }));
      tweens.push(gsap.to(d.bob, { r: range(6, 14) * (rnd() < 0.5 ? -1 : 1), duration: range(4, 7), ease: 'sine.inOut', yoyo: true, repeat: -1, delay: -range(0, 7) }));
      tweens.push(gsap.to(c, { rotationY: '+=' + range(-18, 18), rotationX: '+=' + range(-10, 10), duration: range(5, 9), ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    }
    return d;
  });

  var m = { x: 0, y: 0 }, mt = { x: 0, y: 0 }, prog = { p: 0 };

  function frame() {
    var w = el.offsetWidth, h = el.offsetHeight;
    m.x += (mt.x - m.x) * 0.06;
    m.y += (mt.y - m.y) * 0.06;
    var p = prog.p;
    cards.forEach(function (c, i) {
      var d = data[i];
      var near = (d.z + 1) / 2; /* 0 远 … 1 近 */
      var push = p * scatter;
      gsap.set(c, {
        x: d.x * w * 0.5 * (1 + push * 0.9) - m.x * 40 * mouse * (0.3 + near),
        y: d.y * h * 0.5 * (1 + push * 0.9) + d.bob.y - m.y * 30 * mouse * (0.3 + near) - push * h * 0.25,
        z: d.z * depth * 0.5 + push * depth * (0.8 + near),
        rotationZ: d.rz + d.bob.r + push * d.rz * 2
      });
    });
  }

  function onMove(e) {
    var r = el.getBoundingClientRect();
    mt.x = (e.clientX - r.left) / r.width * 2 - 1;
    mt.y = (e.clientY - r.top) / r.height * 2 - 1;
  }

  var st = null;
  if (scatter && !ctx.reduced) {
    st = ctx.ScrollTrigger.create({
      trigger: el, start: 'top top', end: 'bottom top', scrub: true,
      onUpdate: function (self) { prog.p = self.progress; }
    });
  }

  frame();
  if (!ctx.reduced) gsap.ticker.add(frame);
  if (mouse) window.addEventListener('pointermove', onMove);

  return function () {
    gsap.ticker.remove(frame);
    window.removeEventListener('pointermove', onMove);
    if (st) st.kill();
    tweens.forEach(function (t) { t.kill(); });
    cards.forEach(function (c) { c.removeAttribute('style'); el.appendChild(c); });
    layer.remove();
    if (elStyle == null) el.removeAttribute('style'); else el.setAttribute('style', elStyle);
  };
});
