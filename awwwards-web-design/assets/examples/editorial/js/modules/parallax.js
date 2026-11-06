/*!
 * parallax — 随页面滚动产生不同速度的纵向视差
 * 用法：
 *   <div data-aw="parallax" data-aw-speed="0.2"><img src="image.jpg" alt=""></div>
 *   data-aw-speed="0.2"   视差系数；正数慢于页面，负数反向
 *   data-aw-scale="1.15" 内部图片的缩放比例，用于避免移动露边
 * 元素内有 img 时移动图片并裁切容器，否则移动元素自身；全程 scrub。
 */
AW.register('parallax', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var image = el.querySelector('img');
  var target = image || el;
  var speed = o.speed != null ? o.speed : 0.2;
  var scale = o.scale != null ? o.scale : 1.15;
  var oldOverflow = el.style.overflow;

  if (image) el.style.overflow = 'hidden';
  if (ctx.reduced) { gsap.set(target, { y: 0, scale: 1 }); return; }
  gsap.set(target, { scale: scale });

  function travel() {
    var distance = el.offsetHeight * speed;
    if (image && scale > 1) {
      var limit = el.offsetHeight * (scale - 1) / 2;
      distance = Math.min(Math.abs(distance), limit) * (speed < 0 ? -1 : 1);
    }
    return distance;
  }
  var tween = gsap.fromTo(target,
    { y: function () { return -travel(); } },
    {
      y: function () { return travel(); },
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        invalidateOnRefresh: true
      }
    }
  );

  return function () {
    if (tween.scrollTrigger) tween.scrollTrigger.kill();
    tween.kill();
    if (image) el.style.overflow = oldOverflow;
  };
});
