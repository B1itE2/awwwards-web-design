/*!
 * marquee — 无缝横向跑马灯，滚动页面时加速并跟随滚动方向
 * 用法：
 *   <div data-aw="marquee" data-aw-speed="80" data-aw-direction="1">内容…</div>
 *   data-aw-speed="80"       基础速度，每秒移动的 px 数
 *   data-aw-direction="1"   初始方向，1 向左、-1 向右
 *   data-aw-boost="3"       页面滚动时的最大加速倍数
 * 内容不足一屏时自动复制；窗口缩放后重新测量并补足副本。
 */
AW.register('marquee', function (el, o, ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
  if (ctx.reduced) return;

  var speed = o.speed != null ? o.speed : 80;
  var baseDirection = o.direction === -1 ? -1 : 1;
  var boost = o.boost != null ? o.boost : 3;
  var originalStyle = el.style.cssText;
  var originals = [];
  var clones = [];
  var width = 0, x = 0, direction = baseDirection;
  var scrollBoost = 1, lastScroll = 0, resizeTimer;

  while (el.firstChild) {
    originals.push(el.firstChild);
    el.removeChild(el.firstChild);
  }
  el.style.overflow = 'hidden';

  var track = document.createElement('div');
  var group = document.createElement('div');
  track.style.display = 'flex';
  track.style.width = 'max-content';
  track.style.willChange = 'transform';
  group.style.display = 'flex';
  group.style.flex = 'none';
  for (var i = 0; i < originals.length; i++) group.appendChild(originals[i]);
  track.appendChild(group);
  el.appendChild(track);

  function measure() {
    for (var i = 0; i < clones.length; i++) track.removeChild(clones[i]);
    clones = [];
    width = group.getBoundingClientRect().width;
    if (!width) return;
    var count = Math.max(2, Math.ceil((el.clientWidth + width * 2) / width));
    for (i = 1; i < count; i++) {
      var copy = group.cloneNode(true);
      copy.setAttribute('aria-hidden', 'true');
      track.appendChild(copy);
      clones.push(copy);
    }
    x = gsap.utils.wrap(-width, 0, x);
    gsap.set(track, { x: x });
  }

  var st = ScrollTrigger.create({
    trigger: el,
    start: 'top bottom',
    end: 'bottom top',
    onUpdate: function (self) {
      var velocity = self.getVelocity();
      if (Math.abs(velocity) > 1) {
        direction = velocity > 0 ? 1 : -1;
        scrollBoost = 1 + Math.min(Math.abs(velocity) / 1200, 1) * (boost - 1);
        lastScroll = performance.now();
      }
    }
  });

  function tick(time, deltaTime) {
    if (!width) return;
    var dt = Math.min(deltaTime / 1000, 0.05);
    if (performance.now() - lastScroll > 120) {
      direction = baseDirection;
      scrollBoost += (1 - scrollBoost) * 0.08;
    }
    x = gsap.utils.wrap(-width, 0, x - direction * speed * scrollBoost * dt);
    gsap.set(track, { x: x });
  }

  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(measure, 150);
  }

  measure();
  gsap.ticker.add(tick);
  window.addEventListener('resize', onResize);

  return function () {
    gsap.ticker.remove(tick);
    st.kill();
    window.removeEventListener('resize', onResize);
    clearTimeout(resizeTimer);
    while (group.firstChild) group.removeChild(group.firstChild);
    el.removeChild(track);
    for (var i = 0; i < originals.length; i++) el.appendChild(originals[i]);
    el.style.cssText = originalStyle;
  };
});
