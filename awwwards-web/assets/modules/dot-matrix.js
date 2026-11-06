/*!
 * dot-matrix — Canvas 点阵字标，鼠标附近的点被推开并弹回
 * 用法：
 *   <div data-aw="dot-matrix" data-aw-text="opal" data-aw-gap="8">opal</div>
 *   data-aw-text           必填，要绘制的单词
 *   data-aw-gap="8"        点间距 px
 *   data-aw-dot="1.6"      点半径 px
 *   data-aw-radius="90"    鼠标影响半径 px
 *   data-aw-font           字体，默认取元素 font-family，粗细 800
 * 使用 devicePixelRatio 清晰绘制；仅进入视口时运行循环，触摸/reduced 显示静态点阵。
 */
AW.register('dot-matrix', function (el, o, ctx) {
  var text = o.text || el.textContent;
  if (!text) return function () {};
  var gap = Math.max(2, o.gap != null ? o.gap : 8);
  var dot = o.dot != null ? o.dot : 1.6;
  var radius = o.radius != null ? o.radius : 90;
  var style = window.getComputedStyle(el);
  var font = o.font || style.fontFamily;
  var color = style.color;
  var originalHTML = el.innerHTML;
  var originalLabel = el.getAttribute('aria-label');
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  var interactive = !coarse && !ctx.reduced;
  var canvas = document.createElement('canvas');
  var draw = canvas.getContext('2d');
  var points = [], width = 0, height = 0, dpr = 1;
  var mouseX = -10000, mouseY = -10000, mouseActive = false;
  var raf = 0, inView = false, alive = true, observer = null, resizeObserver = null;
  var resizeTimer = 0;

  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.display = 'block';
  el.setAttribute('aria-label', text);
  el.textContent = '';
  el.appendChild(canvas);

  function render() {
    if (!draw) return;
    draw.clearRect(0, 0, width, height);
    draw.fillStyle = color;
    for (var i = 0; i < points.length; i++) {
      draw.beginPath();
      draw.arc(points[i].x, points[i].y, dot, 0, Math.PI * 2);
      draw.fill();
    }
  }

  function build() {
    if (!alive) return;
    stop();
    width = Math.max(1, el.clientWidth);
    if (width === build.width && points.length) { render(); return; }
    build.width = width;
    var off = document.createElement('canvas');
    var offCtx = off.getContext('2d', { willReadFrequently: true });
    if (!offCtx || !draw) return;
    offCtx.font = '800 100px ' + font;
    var measured = Math.max(1, offCtx.measureText(text).width);
    var fontSize = Math.max(10, 100 * width * 0.94 / measured);
    height = Math.ceil(fontSize * 1.2);
    off.width = Math.ceil(width);
    off.height = height;
    offCtx.font = '800 ' + fontSize + 'px ' + font;
    offCtx.textAlign = 'center';
    offCtx.textBaseline = 'middle';
    offCtx.fillStyle = color;
    offCtx.fillText(text, width / 2, height / 2);
    var pixels = offCtx.getImageData(0, 0, off.width, off.height).data;
    points = [];
    for (var y = gap / 2; y < height; y += gap) {
      for (var x = gap / 2; x < width; x += gap) {
        var alpha = pixels[(Math.floor(y) * off.width + Math.floor(x)) * 4 + 3];
        if (alpha > 100) points.push({ x: x, y: y, ox: x, oy: y, vx: 0, vy: 0 });
      }
    }
    dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    draw.setTransform(dpr, 0, 0, dpr, 0, 0);
    render();
    if (interactive && inView) start();
  }

  function tick() {
    raf = 0;
    if (!alive || !inView || !interactive) return;
    for (var i = 0; i < points.length; i++) {
      var p = points[i];
      if (mouseActive) {
        var dx = p.x - mouseX, dy = p.y - mouseY;
        var distance = Math.sqrt(dx * dx + dy * dy);
        if (distance < radius && distance > 0.01) {
          var force = (1 - distance / radius) * 2.4;
          p.vx += dx / distance * force;
          p.vy += dy / distance * force;
        }
      }
      p.vx += (p.ox - p.x) * 0.075;
      p.vy += (p.oy - p.y) * 0.075;
      p.vx *= 0.84;
      p.vy *= 0.84;
      p.x += p.vx;
      p.y += p.vy;
    }
    render();
    raf = requestAnimationFrame(tick);
  }

  function start() {
    if (!raf && alive && interactive && inView) raf = requestAnimationFrame(tick);
  }
  function stop() { if (raf) cancelAnimationFrame(raf); raf = 0; }
  function onMove(e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = (e.clientX - rect.left) * width / rect.width;
    mouseY = (e.clientY - rect.top) * height / rect.height;
    mouseActive = true;
    start();
  }
  function onLeave() { mouseActive = false; }
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(function () { build.width = 0; build(); }, 120);
  }

  if (interactive) {
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerleave', onLeave);
    if (window.IntersectionObserver) {
      observer = new IntersectionObserver(function (entries) {
        inView = entries[0].isIntersecting;
        if (inView) start(); else stop();
      }, { rootMargin: '0px' });
      observer.observe(el);
    } else {
      inView = true;
      start();
    }
  }
  if (window.ResizeObserver) {
    resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(el);
  } else window.addEventListener('resize', onResize);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { if (alive) { build.width = 0; build(); } });
  build();

  return function () {
    alive = false;
    stop();
    clearTimeout(resizeTimer);
    if (observer) observer.disconnect();
    if (resizeObserver) resizeObserver.disconnect();
    window.removeEventListener('resize', onResize);
    canvas.removeEventListener('pointermove', onMove);
    canvas.removeEventListener('pointerleave', onLeave);
    el.innerHTML = originalHTML;
    if (originalLabel == null) el.removeAttribute('aria-label');
    else el.setAttribute('aria-label', originalLabel);
  };
});
