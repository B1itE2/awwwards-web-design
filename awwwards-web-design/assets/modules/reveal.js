/*!
 * reveal — 文字/元素进场
 * 用法：
 *   <h1 data-aw="reveal" data-aw-split="lines">…</h1>   逐行遮罩升起（默认）
 *   <h1 data-aw="reveal" data-aw-split="chars">…</h1>   逐字升起
 *   <h1 data-aw="reveal" data-aw-split="words">…</h1>   逐词升起
 *   <p  data-aw="reveal" data-aw-split="none">…</p>     整块淡入上移
 *   data-aw-scrub="true"  跟随滚动进度（回滚倒放），默认 false：进入视口播放一次
 *   data-aw-delay="0.2"   延迟（秒），data-aw-stagger 覆盖默认间隔
 *   data-aw-start="top 85%"  ScrollTrigger 起点
 *   data-aw-on="load"     不等滚动，预载结束后立即播放（首屏标题用）
 */
AW.register('reveal', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var split = o.split || 'lines';
  var show = function () { el.classList.add('is-in'); };

  if (ctx.reduced) { show(); return; }

  var targets, splitter, from;
  if (split !== 'none' && window.SplitText) {
    var type = split === 'chars' ? 'lines,words,chars' : split === 'words' ? 'lines,words' : 'lines';
    splitter = new SplitText(el, {
      type: type,
      mask: 'lines',
      linesClass: 'aw-line',
      wordsClass: 'aw-word',
      charsClass: 'aw-char',
      autoSplit: true,
      onSplit: function (self) { if (tl) build(self); }
    });
    targets = splitter[split] || splitter.lines;
    from = { yPercent: 110 };
  } else {
    targets = el;
    from = { y: o.y != null ? o.y : 32, opacity: 0 };
  }

  var stagger = o.stagger != null ? o.stagger : split === 'chars' ? 0.025 : split === 'words' ? 0.06 : 0.1;
  var tl;

  function build(self) {
    if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); }
    var t = self ? (self[split] || self.lines) : targets;
    gsap.set(el, { opacity: 1 });
    show();
    var stOpts = o.on === 'load' ? null : {
      trigger: el,
      start: o.start || 'top 85%',
      end: o.end || 'bottom 40%',
      scrub: o.scrub ? 0.6 : false,
      toggleActions: 'play none none none'
    };
    tl = gsap.timeline({ paused: o.on === 'load', scrollTrigger: stOpts || undefined, delay: o.delay || 0 });
    tl.from(t, Object.assign({}, from, {
      duration: o.duration || (split === 'none' ? 1 : 1.1),
      ease: o.scrub ? 'none' : 'expo.out',
      stagger: stagger
    }));
    if (o.on === 'load') AW.loaded.then(function () { tl.play(); });
  }

  build(splitter);

  return function () {
    if (tl) { tl.scrollTrigger && tl.scrollTrigger.kill(); tl.kill(); }
    if (splitter) splitter.revert();
  };
});
