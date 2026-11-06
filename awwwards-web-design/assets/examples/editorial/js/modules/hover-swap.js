/*!
 * hover-swap — 悬停时文字上下滚动，从无衬线切换为衬线斜体
 * 用法：
 *   <a data-aw="hover-swap" data-aw-font="var(--font-serif)" data-aw-italic="true">About</a>
 *   data-aw-font="var(--font-serif)"  替换字体
 *   data-aw-italic="true"             新文字是否使用斜体
 * 双层均 aria-hidden，原文字保留在 aria-label；触摸屏不启用。
 */
AW.register('hover-swap', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var coarse = window.matchMedia('(pointer: coarse)').matches;
  if (coarse || ctx.reduced) return function () {};
  var font = o.font || 'var(--font-serif)';
  var italic = o.italic !== false;
  var text = el.textContent;
  var originalHTML = el.innerHTML;
  var originalLabel = el.getAttribute('aria-label');
  var originalDisplay = el.style.display;
  var viewport = document.createElement('span');
  var oldLayer = document.createElement('span');
  var newLayer = document.createElement('span');

  el.setAttribute('aria-label', text);
  if (window.getComputedStyle(el).display === 'inline') el.style.display = 'inline-block';
  viewport.style.position = 'relative';
  viewport.style.display = 'inline-block';
  viewport.style.overflow = 'hidden';
  viewport.style.verticalAlign = 'bottom';
  viewport.style.whiteSpace = 'nowrap';
  oldLayer.style.display = 'block';
  oldLayer.style.whiteSpace = 'nowrap';
  oldLayer.textContent = text;
  newLayer.style.position = 'absolute';
  newLayer.style.left = '0';
  newLayer.style.top = '0';
  newLayer.style.display = 'block';
  newLayer.style.whiteSpace = 'nowrap';
  newLayer.style.fontFamily = font;
  newLayer.style.fontStyle = italic ? 'italic' : 'normal';
  newLayer.style.paddingRight = italic ? '0.1em' : '0';  /* 斜体右侧会探出，留一点余量 */
  newLayer.textContent = text;
  oldLayer.setAttribute('aria-hidden', 'true');
  newLayer.setAttribute('aria-hidden', 'true');
  viewport.appendChild(oldLayer);
  viewport.appendChild(newLayer);
  el.textContent = '';
  el.appendChild(viewport);
  viewport.style.width = Math.ceil(Math.max(oldLayer.getBoundingClientRect().width, newLayer.getBoundingClientRect().width)) + 'px';
  viewport.style.height = Math.ceil(Math.max(oldLayer.offsetHeight, newLayer.offsetHeight)) + 'px';
  gsap.set(oldLayer, { yPercent: 0 });
  gsap.set(newLayer, { yPercent: 110 });

  var tl = gsap.timeline({ paused: true });
  tl.to(oldLayer, { yPercent: -110, duration: 0.65, ease: 'expo.out' }, 0);
  tl.to(newLayer, { yPercent: 0, duration: 0.65, ease: 'expo.out' }, 0);
  function enter() { tl.play(); }
  function leave() { tl.reverse(); }
  el.addEventListener('mouseenter', enter);
  el.addEventListener('mouseleave', leave);

  return function () {
    el.removeEventListener('mouseenter', enter);
    el.removeEventListener('mouseleave', leave);
    tl.kill();
    el.innerHTML = originalHTML;
    el.style.display = originalDisplay;
    if (originalLabel == null) el.removeAttribute('aria-label');
    else el.setAttribute('aria-label', originalLabel);
  };
});
