/*!
 * counter — 进入视口后播放一次的数字计数
 * 用法：
 *   <span data-aw="counter" data-aw-to="12800" data-aw-suffix="+">0</span>
 *   data-aw-to             目标数字，必填
 *   data-aw-from="0"       起始数字
 *   data-aw-duration="1.6" 动画时长（秒）
 *   data-aw-decimals="0"   小数位数
 *   data-aw-separator="," 千位分隔符，传空字符串可关闭
 *   data-aw-suffix=""      数字后缀
 */
AW.register('counter', function (el, o, ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
  var to = Number(o.to), from = o.from != null ? Number(o.from) : 0;
  var duration = o.duration != null ? o.duration : 1.6;
  var decimals = Math.max(0, o.decimals != null ? o.decimals : 0);
  var separator = o.separator != null ? (o.separator === true ? '' : String(o.separator)) : ',';
  var suffix = o.suffix != null ? (o.suffix === true ? '' : String(o.suffix)) : '';
  var state = { value: from };
  el.style.fontVariantNumeric = 'tabular-nums';

  function format(value) {
    var parts = value.toFixed(decimals).split('.');
    if (separator) parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, separator);
    return parts.join('.') + suffix;
  }
  function render(value) { el.textContent = format(value); }

  render(from);
  if (ctx.reduced) { render(to); return; }

  var tween = gsap.to(state, {
    value: to,
    duration: duration,
    ease: 'expo.out',
    paused: true,
    onUpdate: function () { render(state.value); },
    onComplete: function () { render(to); }
  });
  var st = ScrollTrigger.create({
    trigger: el,
    start: 'top 85%',
    once: true,
    onEnter: function () { tween.play(); }
  });

  return function () { st.kill(); tween.kill(); };
});
