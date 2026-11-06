/*!
 * clock — 滚动驱动的表盘（实物隐喻）
 * 用法：
 *   <div data-aw="clock" data-aw-turns="2" data-aw-from="10:00" data-aw-to="22:00"></div>
 *   data-aw-turns   滚过该区域时指针转几圈（与 from/to 二选一，turns 优先）
 *   data-aw-from / data-aw-to   起止时刻 "HH:MM"（12 小时制显示，24 小时数值）
 *   data-aw-size="320"   直径 px，默认按容器宽度
 *   data-aw-show-time="true"   在表盘下方显示数字时间
 * 区域：以元素自身为 trigger，从进入视口中线滚到离开底部，全程 scrub。
 */
AW.register('clock', function (el, o, ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
  var size = o.size || Math.min(el.clientWidth || 320, 420);
  var NS = 'http://www.w3.org/2000/svg';
  var svg = document.createElementNS(NS, 'svg');
  svg.setAttribute('viewBox', '0 0 200 200');
  svg.setAttribute('width', size);
  svg.setAttribute('height', size);
  svg.style.display = 'block';

  function node(tag, attrs) {
    var n = document.createElementNS(NS, tag);
    for (var k in attrs) n.setAttribute(k, attrs[k]);
    return n;
  }
  svg.appendChild(node('circle', { cx: 100, cy: 100, r: 98, fill: 'none', stroke: 'currentColor', 'stroke-width': 1.5 }));
  for (var i = 0; i < 60; i++) {
    var a = (i / 60) * Math.PI * 2;
    var r1 = i % 5 === 0 ? 86 : 91;
    svg.appendChild(node('line', {
      x1: 100 + Math.sin(a) * r1, y1: 100 - Math.cos(a) * r1,
      x2: 100 + Math.sin(a) * 96, y2: 100 - Math.cos(a) * 96,
      stroke: 'currentColor', 'stroke-width': i % 5 === 0 ? 1.5 : 0.6
    }));
  }
  var hour = node('line', { x1: 100, y1: 100, x2: 100, y2: 48, stroke: 'currentColor', 'stroke-width': 3, 'stroke-linecap': 'round' });
  var minute = node('line', { x1: 100, y1: 100, x2: 100, y2: 22, stroke: 'currentColor', 'stroke-width': 1.5, 'stroke-linecap': 'round' });
  var second = node('line', { x1: 100, y1: 112, x2: 100, y2: 14, stroke: 'var(--accent)', 'stroke-width': 1, 'stroke-linecap': 'round' });
  svg.appendChild(hour); svg.appendChild(minute); svg.appendChild(second);
  svg.appendChild(node('circle', { cx: 100, cy: 100, r: 3, fill: 'currentColor' }));
  el.appendChild(svg);

  var label = null;
  if (o.showTime) {
    label = document.createElement('div');
    label.className = 't-meta';
    label.style.marginTop = '16px';
    el.appendChild(label);
  }

  function parse(s) { var p = String(s).split(':'); return (+p[0]) * 60 + (+p[1] || 0); }
  var useTurns = o.turns != null;
  var fromMin = parse(o.from || '0:00');
  var toMin = parse(o.to || '12:00');

  function setHands(minutes) {
    var h = (minutes % (12 * 60)) / (12 * 60) * 360;
    var m = (minutes % 60) / 60 * 360;
    var s = (minutes % 1) * 360;
    gsap.set(hour, { rotation: h, svgOrigin: '100 100' });
    gsap.set(minute, { rotation: m, svgOrigin: '100 100' });
    gsap.set(second, { rotation: s, svgOrigin: '100 100' });
    if (label) {
      var hh = Math.floor(minutes / 60) % 24, mm = Math.floor(minutes % 60);
      label.textContent = String(hh).padStart(2, '0') + ':' + String(mm).padStart(2, '0');
    }
  }

  if (ctx.reduced) { setHands(toMin); return; }

  var st = ScrollTrigger.create({
    trigger: el,
    start: 'top 70%',
    end: 'bottom 30%',
    scrub: 0.4,
    onUpdate: function (self) {
      var minutes = useTurns
        ? fromMin + self.progress * o.turns * 60
        : fromMin + (toMin - fromMin) * self.progress;
      setHands(minutes);
    }
  });
  setHands(fromMin);

  return function () { st.kill(); };
});
