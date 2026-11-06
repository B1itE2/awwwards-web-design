/*!
 * theme — 章节经过视口中线时平滑切换整页 CSS 颜色变量
 * 用法：
 *   <section data-aw="theme" data-aw-bg="#111" data-aw-ink="#f2f1ee">…</section>
 *   data-aw-bg       该章节的 --bg 值，可选
 *   data-aw-ink      该章节的 --ink 值，可选
 *   data-aw-accent   该章节的 --accent 值，可选
 * 所有 theme 章节共用一份状态：每次滚动穿过边界时，按"视口中线落在哪个章节"
 * 重新计算目标颜色；不在任何章节内时回到页面原始颜色。相邻章节、回滚都正确。
 */
AW.register('theme', function (el, o, ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
  var root = document.documentElement;
  var names = ['--bg', '--ink', '--accent'];

  /* 共享状态：第一次初始化时记录页面原始颜色（此时还没有任何章节改过颜色） */
  var S = AW._theme;
  if (!S) {
    var cs = getComputedStyle(root);
    var base = {};
    names.forEach(function (n) { base[n] = cs.getPropertyValue(n).trim(); });
    S = AW._theme = { base: base, sections: [], current: null, tween: null };
    S.update = function () {
      var mid = window.innerHeight / 2, hit = null;
      for (var i = 0; i < S.sections.length; i++) {
        var r = S.sections[i].el.getBoundingClientRect();
        if (r.top <= mid && r.bottom > mid) { hit = S.sections[i]; break; }
      }
      if (hit === S.current) return;
      S.current = hit;
      var vars = { duration: ctx.reduced ? 0 : 0.6, ease: 'power3.out', overwrite: true };
      names.forEach(function (n) { vars[n] = (hit && hit.colors[n]) || S.base[n]; });
      if (S.tween) S.tween.kill();
      S.tween = gsap.to(root, vars);
    };
  }

  var entry = { el: el, colors: { '--bg': o.bg, '--ink': o.ink, '--accent': o.accent } };
  S.sections.push(entry);

  var st = ScrollTrigger.create({
    trigger: el,
    start: 'top center',
    end: 'bottom center',
    onToggle: S.update,
    onRefresh: S.update
  });
  S.update();

  return function () {
    st.kill();
    S.sections.splice(S.sections.indexOf(entry), 1);
    if (S.current === entry) { S.current = null; S.update(); }
    if (!S.sections.length) {
      if (S.tween) S.tween.kill();
      names.forEach(function (n) { root.style.removeProperty(n); });
      AW._theme = null;
    }
  };
});
