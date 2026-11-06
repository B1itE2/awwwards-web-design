/*!
 * magnetic — 鼠标靠近时吸附、离开时弹性回位的磁吸元素
 * 用法：
 *   <button data-aw="magnetic" data-aw-strength="0.35" data-aw-radius="80">按钮</button>
 *   data-aw-strength="0.35" 鼠标位移传递给元素的比例
 *   data-aw-radius="80"     元素边界外的触发半径 px
 * pointer: coarse 设备不启用；离开触发范围后用 elastic.out(1, 0.4) 回位。
 */
AW.register('magnetic', function (el, o, ctx) {
  var gsap = ctx.gsap;
  if (ctx.reduced || window.matchMedia('(pointer: coarse)').matches) return;

  var strength = o.strength != null ? o.strength : 0.35;
  var radius = o.radius != null ? o.radius : 80;
  var active = false;

  function reset() {
    if (!active) return;
    active = false;
    gsap.to(el, { x: 0, y: 0, duration: 0.8, ease: 'elastic.out(1, 0.4)', overwrite: true });
  }
  function onMove(e) {
    var r = el.getBoundingClientRect();
    var inside = e.clientX >= r.left - radius && e.clientX <= r.right + radius &&
      e.clientY >= r.top - radius && e.clientY <= r.bottom + radius;
    if (!inside) { reset(); return; }
    active = true;
    gsap.to(el, {
      x: (e.clientX - (r.left + r.width / 2)) * strength,
      y: (e.clientY - (r.top + r.height / 2)) * strength,
      duration: 0.3,
      ease: 'power3.out',
      overwrite: true
    });
  }

  window.addEventListener('pointermove', onMove);
  window.addEventListener('blur', reset);
  return function () {
    window.removeEventListener('pointermove', onMove);
    window.removeEventListener('blur', reset);
    gsap.killTweensOf(el);
  };
});
