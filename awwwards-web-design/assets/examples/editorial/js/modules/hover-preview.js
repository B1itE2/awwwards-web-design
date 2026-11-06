/*!
 * hover-preview — 作品列表悬停出图，预览图缓动跟随并裁切换图
 * 用法：
 *   <ul data-aw="hover-preview" data-aw-lag="0.25"><li data-img="a.jpg">…</li></ul>
 *   data-aw-lag="0.25"       跟随缓动时长（秒）
 *   data-aw-width="320"      图片宽度 px
 *   data-aw-ratio="4/5"     图片宽高比
 * 图片会预加载；预览层不接收指针事件，触摸屏不启用。
 */
AW.register('hover-preview', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse || ctx.reduced) return function () {};

  var lag = o.lag != null ? o.lag : 0.25;
  var width = o.width != null ? o.width : 320;
  var ratio = o.ratio || '4/5';
  var rows = el.querySelectorAll('[data-img]');
  var preview = document.createElement('div');
  var layers = [document.createElement('img'), document.createElement('img')];
  var current = 0, visible = false, activeRow = null;
  var moveTween, showTween, switchTl;
  var lastEvent = null;

  preview.style.position = 'fixed';
  preview.style.left = '0';
  preview.style.top = '0';
  preview.style.width = width + 'px';
  preview.style.aspectRatio = ratio;
  preview.style.overflow = 'hidden';
  preview.style.pointerEvents = 'none';
  preview.style.zIndex = '1000';
  preview.style.opacity = '0';
  for (var i = 0; i < layers.length; i++) {
    layers[i].alt = '';
    layers[i].setAttribute('aria-hidden', 'true');
    layers[i].style.position = 'absolute';
    layers[i].style.inset = '0';
    layers[i].style.width = '100%';
    layers[i].style.height = '100%';
    layers[i].style.objectFit = 'cover';
    layers[i].style.clipPath = 'inset(100% 0 0 0)';
    preview.appendChild(layers[i]);
  }
  document.body.appendChild(preview);

  function move(e, immediate) {
    lastEvent = e;
    var height = preview.getBoundingClientRect().height || width * 1.25;
    var x = Math.min(e.clientX + 24, window.innerWidth - width - 12);
    var y = Math.min(e.clientY - height / 2, window.innerHeight - height - 12);
    x = Math.max(12, x);
    y = Math.max(12, y);
    if (moveTween) moveTween.kill();
    if (immediate) gsap.set(preview, { x: x, y: y });
    else moveTween = gsap.to(preview, { x: x, y: y, duration: lag, ease: 'power3.out', overwrite: 'auto' });  /* 'auto' 只覆盖 x/y；true 会杀掉同元素的淡入动画 */
  }

  function enter(row, e) {
    var src = row.getAttribute('data-img');
    if (!src) return;
    activeRow = row;
    move(e, !visible);
    if (!visible) {
      visible = true;
      if (switchTl) switchTl.kill();
      current = 0;
      layers[0].src = src;
      gsap.set(layers[0], { clipPath: 'inset(0% 0 0 0)' });
      gsap.set(layers[1], { clipPath: 'inset(100% 0 0 0)' });
      if (showTween) showTween.kill();
      gsap.set(preview, { scale: 0.82, opacity: 0, transformOrigin: '50% 50%' });
      showTween = gsap.to(preview, { scale: 1, opacity: 1, duration: 0.7, ease: 'expo.out' });
    } else if (layers[current].getAttribute('src') !== src) {
      var oldLayer = layers[current];
      var next = 1 - current;
      var newLayer = layers[next];
      if (switchTl) switchTl.kill();
      newLayer.src = src;
      gsap.set(oldLayer, { clipPath: 'inset(0% 0 0 0)' });
      gsap.set(newLayer, { clipPath: 'inset(100% 0 0 0)' });
      switchTl = gsap.timeline();
      switchTl.to(oldLayer, { clipPath: 'inset(0 0 100% 0)', duration: 0.65, ease: 'expo.out' }, 0);
      switchTl.to(newLayer, { clipPath: 'inset(0% 0 0 0)', duration: 0.65, ease: 'expo.out' }, 0);
      current = next;
    }
  }

  function leave() {
    if (!visible) return;
    visible = false;
    activeRow = null;
    if (showTween) showTween.kill();
    showTween = gsap.to(preview, { scale: 0.82, opacity: 0, duration: 0.45, ease: 'expo.out' });
  }

  function onMove(e) { if (visible) move(e, false); }
  var listeners = [];
  for (i = 0; i < rows.length; i++) {
    (function (row) {
      var fn = function (e) { enter(row, e); };
      row.addEventListener('mouseenter', fn);
      listeners.push([row, fn]);
      var preload = new Image();
      preload.src = row.getAttribute('data-img') || '';
    })(rows[i]);
  }
  el.addEventListener('mousemove', onMove);
  el.addEventListener('mouseleave', leave);

  return function () {
    for (var i = 0; i < listeners.length; i++) listeners[i][0].removeEventListener('mouseenter', listeners[i][1]);
    el.removeEventListener('mousemove', onMove);
    el.removeEventListener('mouseleave', leave);
    if (moveTween) moveTween.kill();
    if (showTween) showTween.kill();
    if (switchTl) switchTl.kill();
    gsap.killTweensOf(preview);
    gsap.killTweensOf(layers);
    if (preview.parentNode) preview.parentNode.removeChild(preview);
    activeRow = null;
    lastEvent = null;
  };
});
