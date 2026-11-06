/*!
 * steps — 钉住章节 + 逐条叙事（未激活条目压暗）
 * 用法：
 *   <section data-aw="steps" data-aw-distance="300">
 *     <div class="aw-step">…</div>
 *     <div class="aw-step">…</div>
 *   </section>
 *   data-aw-distance  每条占用的滚动距离（vh），默认 100
 *   data-aw-align="left|center"  默认 left
 * 每条 .aw-step 依次成为当前项：opacity 1，其余 0.22。
 */
AW.register('steps', function (el, o, ctx) {
  var gsap = ctx.gsap, ScrollTrigger = ctx.ScrollTrigger;
  var items = Array.prototype.slice.call(el.querySelectorAll('.aw-step'));
  if (!items.length) return;

  if (ctx.reduced) { items.forEach(function (it) { it.style.opacity = 1; }); return; }

  gsap.set(items, { opacity: 0.22 });
  gsap.set(items[0], { opacity: 1 });

  var dist = (o.distance || 100) * items.length;
  var current = 0;
  function activate(idx) {
    if (idx === current) return;
    current = idx;
    items.forEach(function (it, i) {
      gsap.to(it, { opacity: i === idx ? 1 : 0.22, duration: 0.5, ease: 'power2.out', overwrite: 'auto' });
    });
  }
  var st = ScrollTrigger.create({
    trigger: el,
    start: 'top top',
    end: '+=' + dist + 'vh',
    pin: true,
    scrub: true,
    anticipatePin: 1,
    onUpdate: function (self) {
      activate(Math.min(items.length - 1, Math.floor(self.progress * items.length)));
    }
  });

  return function () { st.kill(); };
});
