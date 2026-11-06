/*!
 * img-reveal — 图片以 inset() 裁切揭示，同时从放大状态归位
 * 用法：
 *   <div data-aw="img-reveal" data-aw-from="bottom"><img src="image.jpg" alt=""></div>
 *   data-aw-from="bottom"  揭示方向：bottom / top / left / right
 *   data-aw-duration="1.4" 动画时长（秒）
 * 进入视口后只播放一次；目标元素内的 img 从 1.3 倍缩放至 1 倍。
 */
AW.register('img-reveal', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var image = el.tagName === 'IMG' ? el : el.querySelector('img');
  var direction = o.from || 'bottom';
  var duration = o.duration != null ? o.duration : 1.4;
  var clips = {
    bottom: 'inset(100% 0% 0% 0%)',
    top: 'inset(0% 0% 100% 0%)',
    left: 'inset(0% 100% 0% 0%)',
    right: 'inset(0% 0% 0% 100%)'
  };
  var initial = clips[direction] || clips.bottom;
  el.style.overflow = 'hidden';

  if (ctx.reduced) {
    gsap.set(el, { clipPath: 'inset(0% 0% 0% 0%)' });
    if (image) gsap.set(image, { scale: 1 });
    return;
  }

  gsap.set(el, { clipPath: initial });
  if (image) gsap.set(image, { scale: 1.3 });
  var tl = gsap.timeline({
    scrollTrigger: {
      trigger: el,
      start: 'top 85%',
      once: true
    }
  });
  tl.to(el, { clipPath: 'inset(0% 0% 0% 0%)', duration: duration, ease: 'expo.out' }, 0);
  if (image) tl.to(image, { scale: 1, duration: duration, ease: 'expo.out' }, 0);

  return function () {
    if (tl.scrollTrigger) tl.scrollTrigger.kill();
    tl.kill();
  };
});
