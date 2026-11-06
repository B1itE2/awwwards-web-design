/*!
 * rotate — 通用滚动旋转，适用于唱片、齿轮、罗盘等实物隐喻
 * 用法：
 *   <div data-aw="rotate" data-aw-turns="1">…</div>
 *   data-aw-turns="1"             滚过区域时旋转圈数，负数反向
 *   data-aw-start="top bottom"   ScrollTrigger 起点
 *   data-aw-end="bottom top"     ScrollTrigger 终点
 * 动画作用于元素自身，scrub 回滚时同步倒转。
 */
AW.register('rotate', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var turns = o.turns != null ? o.turns : 1;
  var originalTransform = el.style.transform;
  var tween = null;

  if (ctx.reduced) gsap.set(el, { rotation: turns * 360 });
  else if (turns !== 0) {
    tween = gsap.fromTo(el, { rotation: 0 }, {
      rotation: turns * 360,
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: o.start || 'top bottom',
        end: o.end || 'bottom top',
        scrub: true
      }
    });
  }

  return function () {
    if (tween) {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    }
    el.style.transform = originalTransform;
  };
});
