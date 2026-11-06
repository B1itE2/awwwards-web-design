/*!
 * drag-gallery — 横向拖拽画廊，惯性滑行并在边缘阻尼回弹
 * 用法：
 *   <div data-aw="drag-gallery"><div class="aw-track">…</div></div>
 *   data-aw-friction="0.92"  惯性衰减系数
 *   data-aw-edge="0.35"      越界拖拽阻尼
 * 支持鼠标、触摸、横向滚轮/触控板；拖动超过 5px 后阻止子元素点击。
 */
AW.register('drag-gallery', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var track = el.querySelector('.aw-track');
  if (!track) return function () {};
  var friction = Math.max(0.01, Math.min(0.99, o.friction != null ? o.friction : 0.92));
  var edge = Math.max(0.01, Math.min(1, o.edge != null ? o.edge : 0.35));
  var originalCursor = el.style.cursor;
  var originalTouchAction = el.style.touchAction;
  var originalUserSelect = el.style.userSelect;
  var originalTrackTransform = track.style.transform;
  var originalWillChange = track.style.willChange;
  var max = 0, pos = 0, velocity = 0;
  var pressed = false, dragged = false, suppressClick = false;
  var pointerId = null, startX = 0, startPos = 0, lastX = 0, lastTime = 0;
  var raf = 0, observer = null, clickTimer = 0, alive = true;

  el.style.cursor = 'grab';
  el.style.touchAction = 'pan-y';
  track.style.willChange = 'transform';

  function clamp(value) { return Math.max(-max, Math.min(0, value)); }
  function resist(value) {
    if (value > 0) return value * edge;
    if (value < -max) return -max + (value + max) * edge;
    return value;
  }
  function render() { gsap.set(track, { x: pos }); }
  function measure() {
    max = Math.max(0, track.scrollWidth - el.clientWidth);
    pos = clamp(pos);
    render();
  }
  function stopFrame() {
    if (raf) cancelAnimationFrame(raf);
    raf = 0;
  }

  function frame(now) {
    raf = 0;
    if (!alive || pressed) return;
    var dt = lastTime ? Math.min((now - lastTime) / 16.6667, 2) : 1;
    lastTime = now;
    if (pos > 0 || pos < -max) {
      var target = pos > 0 ? 0 : -max;
      pos += (target - pos) * Math.min(1, (0.12 + (1 - edge) * 0.2) * dt);
      velocity *= Math.pow(friction, dt);
      if (Math.abs(target - pos) < 0.2) { pos = target; velocity = 0; }
    } else {
      pos += velocity * dt;
      velocity *= Math.pow(friction, dt);
      if (pos > 0 || pos < -max) pos = resist(pos);
      if (Math.abs(velocity) < 0.05 && pos <= 0 && pos >= -max) velocity = 0;
    }
    pos = Math.max(-max - 120, Math.min(120, pos));
    render();
    if (velocity || pos > 0 || pos < -max) raf = requestAnimationFrame(frame);
    else lastTime = 0;
  }

  function coast() {
    stopFrame();
    if (ctx.reduced) {
      pos = clamp(pos);
      velocity = 0;
      render();
      return;
    }
    lastTime = 0;
    raf = requestAnimationFrame(frame);
  }

  function onPointerDown(e) {
    if (!max || (e.pointerType === 'mouse' && e.button !== 0)) return;
    stopFrame();
    pressed = true;
    dragged = false;
    suppressClick = false;
    pointerId = e.pointerId;
    startX = lastX = e.clientX;
    startPos = pos;
    velocity = 0;
    lastTime = performance.now();
    el.style.cursor = 'grabbing';
    el.style.userSelect = 'none';
  }

  function onPointerMove(e) {
    if (!pressed || e.pointerId !== pointerId) return;
    var now = performance.now();
    var dt = Math.max(1, now - lastTime);
    var next = resist(startPos + e.clientX - startX);
    velocity = (next - pos) / dt * 16.6667;
    pos = next;
    lastX = e.clientX;
    lastTime = now;
    if (!dragged && Math.abs(e.clientX - startX) > 5) {
      dragged = true;
      /* 真正开始拖动后才捕获指针；按下就捕获会让子元素链接收不到 click */
      if (el.setPointerCapture) el.setPointerCapture(pointerId);
    }
    if (dragged && e.cancelable) e.preventDefault();
    render();
  }

  function onPointerUp(e) {
    if (!pressed || e.pointerId !== pointerId) return;
    pressed = false;
    el.style.cursor = 'grab';
    el.style.userSelect = originalUserSelect;
    if (el.releasePointerCapture && el.hasPointerCapture(pointerId)) el.releasePointerCapture(pointerId);
    pointerId = null;
    if (dragged) {
      suppressClick = true;
      clearTimeout(clickTimer);
      clickTimer = setTimeout(function () { suppressClick = false; }, 80);
    }
    coast();
  }

  function onClick(e) {
    if (!suppressClick) return;
    e.preventDefault();
    e.stopPropagation();
    suppressClick = false;
  }

  function onWheel(e) {
    if (!max) return;
    var horizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
    if (!horizontal) return;
    var delta = e.deltaX || e.deltaY;
    if (e.deltaMode === 1) delta *= 16;
    if (e.cancelable) e.preventDefault();
    stopFrame();
    pos = resist(pos - delta);
    velocity = 0;
    render();
    coast();
  }

  function onDragStart(e) { e.preventDefault(); }
  function onCancel(e) { if (pressed) onPointerUp(e); }

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onCancel);
  el.addEventListener('click', onClick, true);
  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('dragstart', onDragStart);
  if (window.ResizeObserver) {
    observer = new ResizeObserver(measure);
    observer.observe(el);
    observer.observe(track);
  }
  window.addEventListener('resize', measure);
  measure();

  return function () {
    alive = false;
    stopFrame();
    clearTimeout(clickTimer);
    if (observer) observer.disconnect();
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onCancel);
    el.removeEventListener('click', onClick, true);
    el.removeEventListener('wheel', onWheel);
    el.removeEventListener('dragstart', onDragStart);
    window.removeEventListener('resize', measure);
    el.style.cursor = originalCursor;
    el.style.touchAction = originalTouchAction;
    el.style.userSelect = originalUserSelect;
    track.style.transform = originalTrackTransform;
    track.style.willChange = originalWillChange;
  };
});
