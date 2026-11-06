/*!
 * odometer — 滚动驱动的里程表：每位数字是竖向滚轮，连续滚动，进位时高位一起转
 * 用法：
 *   <div data-aw="odometer" data-aw-from="0" data-aw-to="2026"></div>
 *   data-aw-from="0"           起始非负整数
 *   data-aw-to                 目标非负整数，必填
 *   data-aw-start="top 80%"   ScrollTrigger 起点
 *   data-aw-end="bottom 20%"  ScrollTrigger 终点
 * 全程 scrub，回滚倒转。个位随数值连续滚动；某位在下一位从 9 滚向 0 的过程中同步转一格，
 * 和机械里程表一致。
 */
AW.register('odometer', function (el, o, ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
  var from = Math.max(0, Math.round(o.from != null ? Number(o.from) : 0));
  var to = Math.max(0, Math.round(Number(o.to)));
  var originalHTML = el.innerHTML;
  var originalStyle = el.style.cssText;
  var length = Math.max(String(from).length, String(to).length);
  var strips = [];

  el.innerHTML = '';
  el.setAttribute('aria-label', String(to));
  el.style.display = 'inline-flex';
  el.style.fontVariantNumeric = 'tabular-nums';
  el.style.lineHeight = '1';

  for (var i = 0; i < length; i++) {
    var reel = document.createElement('span');
    var strip = document.createElement('span');
    reel.setAttribute('aria-hidden', 'true');
    reel.style.cssText = 'display:inline-block;height:1em;overflow:hidden;';
    strip.style.cssText = 'display:block;will-change:transform;';
    /* 0–9 再接一个 0，从 9 滚到 0 时无缝 */
    for (var n = 0; n <= 10; n++) {
      var d = document.createElement('span');
      d.textContent = n % 10;
      d.style.cssText = 'display:block;height:1em;';
      strip.appendChild(d);
    }
    reel.appendChild(strip);
    el.appendChild(reel);
    strips.push(strip);
  }

  /* value 可以是小数；返回每一位应停在的位置（0–10 之间的连续值） */
  function positions(value) {
    var out = [];
    for (var i = 0; i < length; i++) {
      var place = Math.pow(10, length - 1 - i);
      var digit = Math.floor(value / place) % 10;
      var below = value % place;               /* 低位组成的数 */
      var carry = 0;
      if (place === 1) {
        carry = value - Math.floor(value);     /* 个位：连续滚动 */
      } else if (below > place - 1) {
        carry = below - (place - 1);           /* 低位全是 9 并正在进位时，本位跟着转 */
      }
      out.push(digit + carry);
    }
    return out;
  }

  function render(progress) {
    var p = positions(from + (to - from) * progress);
    for (var i = 0; i < length; i++) {
      strips[i].style.transform = 'translateY(' + (-p[i] / 11 * 100) + '%)';
    }
  }

  if (ctx.reduced) { render(1); return function () { el.innerHTML = originalHTML; el.style.cssText = originalStyle; }; }

  var st = ScrollTrigger.create({
    trigger: el,
    start: o.start || 'top 80%',
    end: o.end || 'bottom 20%',
    scrub: true,
    onUpdate: function (self) { render(self.progress); }
  });
  render(0);

  return function () {
    st.kill();
    el.innerHTML = originalHTML;
    el.style.cssText = originalStyle;
  };
});
