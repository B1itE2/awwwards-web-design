/*!
 * hscroll — 区块钉住后将纵向滚动转换为一行卡片的横向位移
 * 用法：
 *   <section data-aw="hscroll" data-aw-speed="1"><div class="aw-track">卡片…</div></section>
 *   data-aw-speed="1" 滚动距离倍数；实际横向距离为 track 宽度减视口宽度
 * 手机端改为原生横向滑动，不钉住区块；桌面端全程 scrub。
 */
AW.register('hscroll', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var track = el.querySelector('.aw-track');
  if (!track) return function () {};
  var speed = o.speed != null ? o.speed : 1;
  var elStyle = el.style.cssText, trackStyle = track.style.cssText;

  if (ctx.reduced) { gsap.set(track, { x: 0 }); return; }
  if (ctx.isMobile) {
    el.style.overflowX = 'auto';
    el.style.webkitOverflowScrolling = 'touch';
    track.style.width = 'max-content';
    return function () {
      el.style.cssText = elStyle;
      track.style.cssText = trackStyle;
    };
  }

  el.style.overflow = 'hidden';  /* track 比视口宽，不裁切会让整页可以横向滚动 */
  track.style.willChange = 'transform';
  function distance() { return Math.max(0, track.scrollWidth - window.innerWidth); }
  var tween = gsap.to(track, {
    x: function () { return -distance(); },
    ease: 'none',
    scrollTrigger: {
      trigger: el,
      start: 'top top',
      end: function () { return '+=' + Math.max(1, distance() * speed); },
      pin: true,
      scrub: true,
      anticipatePin: 1,
      invalidateOnRefresh: true
    }
  });

  return function () {
    if (tween.scrollTrigger) tween.scrollTrigger.kill();
    tween.kill();
    el.style.cssText = elStyle;
    track.style.cssText = trackStyle;
  };
});
