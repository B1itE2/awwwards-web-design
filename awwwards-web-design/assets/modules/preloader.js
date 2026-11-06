/*!
 * preloader — 进场仪式：百分比计数，完成后升起离开
 * 用法：<div data-aw="preloader" data-aw-min="1.2"></div>
 *   data-aw-min   最短停留秒数，默认 1.0；最长 2.5 秒强制结束
 * 完成后调用 AW.releaseLoad()，其它 data-aw-on="load" 的动画才会开始。
 * 第二次访问（sessionStorage）直接跳过。
 */
AW.register('preloader', function (el, o, ctx) {
  var gsap = ctx.gsap;
  AW.holdLoad();

  var key = 'aw-seen-' + location.pathname;
  var seen = false;
  try { seen = sessionStorage.getItem(key) === '1'; } catch (e) {}

  el.style.cssText = 'position:fixed;inset:0;z-index:100;background:var(--bg);color:var(--ink);display:flex;align-items:flex-end;justify-content:space-between;padding:var(--margin);';
  var brand = document.createElement('div');
  brand.className = 't-meta';
  brand.textContent = document.title || '';
  var num = document.createElement('div');
  num.className = 't-display';
  num.style.fontSize = 'clamp(48px, 8vw, 140px)';
  num.textContent = '0';
  el.appendChild(brand); el.appendChild(num);

  var done = false;
  function finish() {
    if (done) return;
    done = true;
    clearTimeout(timer);
    try { sessionStorage.setItem(key, '1'); } catch (e) {}
    gsap.to(el, {
      yPercent: -100, duration: 0.9, ease: 'expo.inOut',
      onComplete: function () { el.remove(); AW.releaseLoad(); }
    });
  }

  if (seen || ctx.reduced) { el.remove(); AW.releaseLoad(); return; }

  var counter = { v: 0 };
  var min = o.min != null ? o.min : 1.0;
  var timer = setTimeout(finish, 2500);
  gsap.to(counter, {
    v: 100, duration: min, ease: 'power1.inOut',
    onUpdate: function () { num.textContent = Math.round(counter.v); },
    onComplete: finish
  });
  return function () { clearTimeout(timer); };
});
