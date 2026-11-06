/*!
 * hero-cycle — 首屏巨字固定，背景图片/视频交叉淡入并缓慢缩放
 * 用法：
 *   <section data-aw="hero-cycle"><div class="aw-media"><img><video></div><h1>…</h1></section>
 *   data-aw-interval="3.5"  每张完整展示时长（秒）
 *   data-aw-duration="1.2"  交叉淡入时长（秒）
 * 视频切入时从头播放、切出时暂停；页面不可见时暂停轮换。
 */
AW.register('hero-cycle', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var interval = o.interval != null ? o.interval : 3.5;
  var duration = o.duration != null ? o.duration : 1.2;
  var wrap = el.querySelector('.aw-media');
  if (!wrap) return function () {};
  var media = wrap.querySelectorAll('img, video');
  if (!media.length) return function () {};

  var sectionStyle = el.style.cssText;
  var wrapStyle = wrap.style.cssText;
  var heading = el.querySelector('h1');
  var headingStyle = heading ? heading.style.cssText : '';
  var itemStyles = [];
  var current = 0, timer = null, fade = null, zoom = null, alive = true;

  if (window.getComputedStyle(el).position === 'static') el.style.position = 'relative';
  el.style.overflow = 'hidden';
  wrap.style.position = 'absolute';
  wrap.style.inset = '0';
  wrap.style.overflow = 'hidden';
  if (heading) heading.style.position = 'relative';
  for (var i = 0; i < media.length; i++) {
    itemStyles.push(media[i].style.cssText);
    media[i].style.position = 'absolute';
    media[i].style.inset = '0';
    media[i].style.width = '100%';
    media[i].style.height = '100%';
    media[i].style.objectFit = 'cover';
    media[i].style.opacity = '0';
    media[i].style.pointerEvents = 'none';
  }

  function play(item) {
    if (item.tagName !== 'VIDEO') return;
    var promise = item.play();
    if (promise && promise.catch) promise.catch(function () {});
  }

  function startZoom(item) {
    if (zoom) zoom.kill();
    gsap.set(item, { scale: ctx.reduced ? 1 : 1.08, transformOrigin: '50% 50%' });
    if (!ctx.reduced) zoom = gsap.to(item, { scale: 1, duration: interval + duration, ease: 'none' });
  }

  function schedule() {
    if (ctx.reduced || media.length < 2 || !alive) return;
    if (timer) timer.kill();
    timer = gsap.delayedCall(interval, next);
    if (document.hidden) timer.pause();
  }

  function next() {
    if (!alive) return;
    var oldItem = media[current];
    var index = (current + 1) % media.length;
    var item = media[index];
    if (zoom) zoom.kill();
    gsap.set(item, { opacity: 0, scale: 1.08 });
    if (item.tagName === 'VIDEO') {
      try { item.currentTime = 0; } catch (err) {}
      play(item);
    }
    zoom = gsap.to(item, { scale: 1, duration: interval + duration, ease: 'none' });
    fade = gsap.timeline({
      onComplete: function () {
        if (oldItem.tagName === 'VIDEO') oldItem.pause();
        gsap.set(oldItem, { opacity: 0 });
        current = index;
        schedule();
      }
    });
    fade.to(oldItem, { opacity: 0, duration: duration, ease: 'expo.out' }, 0);
    fade.to(item, { opacity: 1, duration: duration, ease: 'expo.out' }, 0);
    if (document.hidden) {
      fade.pause();
      zoom.pause();
    }
  }

  function onVisibility() {
    var active = [timer, fade, zoom];
    for (var i = 0; i < active.length; i++) {
      if (!active[i]) continue;
      if (document.hidden) active[i].pause();
      else active[i].resume();
    }
    if (document.hidden) {
      for (i = 0; i < media.length; i++) if (media[i].tagName === 'VIDEO') media[i].pause();
    } else if (!ctx.reduced) {
      play(media[current]);
      if (fade && fade.isActive()) {
        var upcoming = media[(current + 1) % media.length];
        play(upcoming);
      }
    }
  }

  gsap.set(media[0], { opacity: 1 });
  startZoom(media[0]);
  if (!ctx.reduced) play(media[0]);
  schedule();
  document.addEventListener('visibilitychange', onVisibility);
  if (document.hidden) onVisibility();

  return function () {
    alive = false;
    document.removeEventListener('visibilitychange', onVisibility);
    if (timer) timer.kill();
    if (fade) fade.kill();
    if (zoom) zoom.kill();
    for (var i = 0; i < media.length; i++) {
      if (media[i].tagName === 'VIDEO') media[i].pause();
      media[i].style.cssText = itemStyles[i];
    }
    el.style.cssText = sectionStyle;
    wrap.style.cssText = wrapStyle;
    if (heading) heading.style.cssText = headingStyle;
  };
});
