/*!
 * scribble — 悬停或聚焦时绘制不规则手绘椭圆，离开时反向擦除
 * 用法：
 *   <a href="/" data-aw="scribble" data-aw-color="var(--accent)">链接</a>
 *   data-aw-color="var(--accent)" 线条颜色
 *   data-aw-stroke="1.5"          线条宽度
 * SVG 覆盖在元素外围；描线时长 0.6 秒，不拦截元素自身交互。
 */
AW.register('scribble', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var NS = 'http://www.w3.org/2000/svg';
  var oldPosition = el.style.position;
  var changedPosition = window.getComputedStyle(el).position === 'static';
  if (changedPosition) el.style.position = 'relative';

  var svg = document.createElementNS(NS, 'svg');
  var path = document.createElementNS(NS, 'path');
  svg.setAttribute('viewBox', '0 0 120 80');
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.position = 'absolute';
  svg.style.left = '-8%';
  svg.style.top = '-14%';
  svg.style.width = '116%';
  svg.style.height = '128%';
  svg.style.overflow = 'visible';
  svg.style.pointerEvents = 'none';
  path.setAttribute('d', 'M60 5 C84 2 111 12 114 34 C119 59 95 74 64 76 C32 80 8 67 6 43 C3 20 25 8 54 6');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', o.color || 'var(--accent)');
  path.setAttribute('stroke-width', o.stroke != null ? o.stroke : 1.5);
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.appendChild(path);
  el.appendChild(svg);

  var length = path.getTotalLength();
  gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
  if (ctx.reduced) { gsap.set(path, { strokeDashoffset: 0 }); return; }

  function draw() {
    /* 擦除后 offset 停在 -length；先复位到 +length，保证每次都从起点正向描线 */
    if (parseFloat(gsap.getProperty(path, 'strokeDashoffset')) < 0) gsap.set(path, { strokeDashoffset: length });
    gsap.to(path, { strokeDashoffset: 0, duration: 0.6, ease: 'power3.out', overwrite: true });
  }
  function erase() {
    gsap.to(path, { strokeDashoffset: -length, duration: 0.45, ease: 'power3.out', overwrite: true });
  }
  function onFocusOut(e) {
    if (!e.relatedTarget || !el.contains(e.relatedTarget)) erase();
  }

  el.addEventListener('mouseenter', draw);
  el.addEventListener('mouseleave', erase);
  el.addEventListener('focusin', draw);
  el.addEventListener('focusout', onFocusOut);

  return function () {
    el.removeEventListener('mouseenter', draw);
    el.removeEventListener('mouseleave', erase);
    el.removeEventListener('focusin', draw);
    el.removeEventListener('focusout', onFocusOut);
    gsap.killTweensOf(path);
    if (svg.parentNode) svg.parentNode.removeChild(svg);
    if (changedPosition) el.style.position = oldPosition;
  };
});
