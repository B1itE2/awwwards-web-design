/*!
 * cursor — 带缓动跟随与悬停文字的自定义光标
 * 用法：
 *   <body data-aw="cursor" data-aw-size="12" data-aw-hover-size="64">
 *   <a href="/" data-cursor="打开">链接</a>
 *   data-aw-size="12"        圆点直径 px
 *   data-aw-hover-size="64" 悬停后的圆点直径 px
 *   data-aw-lag="0.18"       跟随延迟系数
 * pointer: coarse 设备不启用；输入框、文本域和可编辑区域保留原生光标。
 */
AW.register('cursor', function (el, o, ctx) {
  var gsap = ctx.gsap;
  if (ctx.reduced || window.matchMedia('(pointer: coarse)').matches) return;

  var size = o.size != null ? o.size : 12;
  var hoverSize = o.hoverSize != null ? o.hoverSize : 64;
  var lag = o.lag != null ? o.lag : 0.18;
  var root = document.documentElement;
  var cursor = document.createElement('div');
  var dot = document.createElement('div');
  var label = document.createElement('span');
  var active = null;

  cursor.setAttribute('aria-hidden', 'true');
  cursor.style.position = 'fixed';
  cursor.style.left = '0';
  cursor.style.top = '0';
  cursor.style.zIndex = '90';
  cursor.style.pointerEvents = 'none';
  cursor.style.opacity = '0';
  cursor.style.mixBlendMode = 'difference';
  dot.style.width = size + 'px';
  dot.style.height = size + 'px';
  dot.style.borderRadius = '50%';
  dot.style.background = '#fff';  /* 白色 + difference：任何底色上都反色可见 */
  label.style.position = 'absolute';
  label.style.left = '0';
  label.style.top = '0';
  label.style.width = hoverSize + 'px';
  label.style.transform = 'translate(-50%, -50%)';
  label.style.color = '#000';
  label.style.fontSize = '11px';
  label.style.lineHeight = '1.2';
  label.style.textAlign = 'center';
  label.style.opacity = '0';
  label.style.pointerEvents = 'none';
  cursor.appendChild(dot);
  cursor.appendChild(label);
  el.appendChild(cursor);
  root.classList.add('aw-cursor-active');

  var style = document.createElement('style');
  style.textContent = '.aw-cursor-active,.aw-cursor-active *{cursor:none!important}.aw-cursor-active input,.aw-cursor-active textarea,.aw-cursor-active select,.aw-cursor-active [contenteditable]{cursor:auto!important}';
  document.head.appendChild(style);
  gsap.set(dot, { xPercent: -50, yPercent: -50 });

  var moveX = gsap.quickTo(cursor, 'x', { duration: lag, ease: 'power3.out' });
  var moveY = gsap.quickTo(cursor, 'y', { duration: lag, ease: 'power3.out' });

  function hoverTarget(target) {
    return target && target.closest ? target.closest('a, button, [data-cursor]') : null;
  }
  function setHover(target) {
    if (active === target) return;
    active = target;
    var text = target && target.getAttribute('data-cursor');
    label.textContent = text || '';
    gsap.to(dot, { scale: target ? hoverSize / size : 1, duration: 0.25, ease: 'power3.out', overwrite: true });
    gsap.to(label, { opacity: text ? 1 : 0, duration: 0.2, ease: 'power3.out', overwrite: true });
  }
  function onMove(e) {
    moveX(e.clientX);
    moveY(e.clientY);
    gsap.to(cursor, { opacity: 1, duration: 0.15, ease: 'power3.out', overwrite: 'auto' });
  }
  function onOver(e) { setHover(hoverTarget(e.target)); }
  function onOut(e) {
    if (active && e.relatedTarget && active.contains(e.relatedTarget)) return;
    if (!hoverTarget(e.relatedTarget)) setHover(null);
    if (!e.relatedTarget) gsap.set(cursor, { opacity: 0 });
  }

  window.addEventListener('pointermove', onMove);
  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onOut);

  return function () {
    window.removeEventListener('pointermove', onMove);
    document.removeEventListener('pointerover', onOver);
    document.removeEventListener('pointerout', onOut);
    gsap.killTweensOf([cursor, dot, label]);
    root.classList.remove('aw-cursor-active');
    if (cursor.parentNode) cursor.parentNode.removeChild(cursor);
    if (style.parentNode) style.parentNode.removeChild(style);
  };
});
