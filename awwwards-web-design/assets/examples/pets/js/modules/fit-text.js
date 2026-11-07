/*!
 * fit-text — 文字自动缩放到正好撑满容器宽度
 * 用法：
 *   <div data-aw="fit-text" data-aw-max="240" data-aw-reveal="true">BRAND</div>
 *   data-aw-max            最大字号 px，默认无上限
 *   data-aw-reveal="true"  进入视口时逐字升起，默认 true
 * 仅在初始化、字体就绪及 ResizeObserver 回调中设置 font-size，不做字号动画。
 */
AW.register('fit-text', function (el, o, ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
  var max = o.max != null ? o.max : Infinity;
  var reveal = o.reveal !== false;
  var originalHTML = el.innerHTML;
  var originalFontSize = el.style.fontSize;
  var originalWhiteSpace = el.style.whiteSpace;
  var originalLabel = el.getAttribute('aria-label');
  var text = el.textContent;
  var inners = [], tl = null, st = null, observer = null, alive = true;

  el.style.whiteSpace = 'nowrap';
  if (reveal && !ctx.reduced) {
    el.setAttribute('aria-label', text);
    el.textContent = '';
    for (var i = 0; i < text.length; i++) {
      var outer = document.createElement('span');
      var inner = document.createElement('span');
      outer.setAttribute('aria-hidden', 'true');
      outer.style.display = 'inline-block';
      /* 只裁下方，左右上留余量：字距收紧时字母边缘不被切掉 */
      outer.style.clipPath = 'inset(-0.5em -0.2em -0.12em -0.2em)';
      outer.style.verticalAlign = 'bottom';
      inner.style.display = 'inline-block';
      inner.textContent = /\s/.test(text.charAt(i)) ? '\u00a0' : text.charAt(i);
      outer.appendChild(inner);
      el.appendChild(outer);
      inners.push(inner);
    }
  }

  function textWidth() {
    var range = document.createRange();
    range.selectNodeContents(el);
    var width = range.getBoundingClientRect().width;
    range.detach();
    return width;
  }

  function fit() {
    if (!alive) return;
    var style = window.getComputedStyle(el);
    var target = el.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    if (target <= 0 || !text) return;
    var low = 0, high = Math.min(16, max);
    el.style.fontSize = high + 'px';
    while (textWidth() < target && high < max) {
      low = high;
      high = Math.min(max, high * 2);
      el.style.fontSize = high + 'px';
      if (high === max) break;
    }
    low = Math.max(0, low);
    for (var i = 0; i < 22; i++) {
      var mid = (low + high) / 2;
      el.style.fontSize = mid + 'px';
      if (textWidth() <= target) low = mid;
      else high = mid;
    }
    el.style.fontSize = low + 'px';
  }

  fit();
  if (window.ResizeObserver) {
    observer = new ResizeObserver(fit);
    observer.observe(el);
  }
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(function () {
      if (!alive) return;
      fit();
      if (ScrollTrigger) ScrollTrigger.refresh();
    });
  }

  if (inners.length) {
    gsap.set(inners, { yPercent: 130 });
    tl = gsap.timeline({ paused: true });
    tl.to(inners, { yPercent: 0, duration: 1, ease: 'expo.out', stagger: 0.035 });
    st = ScrollTrigger.create({
      trigger: el,
      start: 'top 85%',
      once: true,
      onEnter: function () {
        gsap.set(inners, { yPercent: 130 });
        tl.restart();
      }
    });
  }

  return function () {
    alive = false;
    if (observer) observer.disconnect();
    if (st) st.kill();
    if (tl) tl.kill();
    el.innerHTML = originalHTML;
    el.style.fontSize = originalFontSize;
    el.style.whiteSpace = originalWhiteSpace;
    if (originalLabel == null) el.removeAttribute('aria-label');
    else el.setAttribute('aria-label', originalLabel);
  };
});
