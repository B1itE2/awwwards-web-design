/*!
 * aw-core.js — awwwards-web skill runtime
 * 负责：Lenis 平滑滚动、GSAP/ScrollTrigger 注册、减少动效检测、模块自动挂载。
 *
 * 模块接口：
 *   AW.register('name', function (el, opts, ctx) { ...; return optionalCleanupFn })
 *   HTML：<div data-aw="name" data-aw-speed="0.5">   多个模块用空格分隔：data-aw="reveal parallax"
 *   opts 由 data-aw-* 转成 camelCase，数字/布尔自动转换：data-aw-from-y="40" → opts.fromY === 40
 *   ctx = { gsap, ScrollTrigger, lenis, reduced, isMobile }
 */
(function () {
  'use strict';

  var modules = {};
  var mounted = [];
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var isMobile = window.matchMedia('(max-width: 767px)').matches;

  function parseValue(v) {
    if (v === 'true' || v === '') return true;
    if (v === 'false') return false;
    if (v !== null && v.trim() !== '' && !isNaN(v)) return Number(v);
    return v;
  }

  function readOpts(el) {
    var opts = {};
    for (var i = 0; i < el.attributes.length; i++) {
      var a = el.attributes[i];
      if (a.name.indexOf('data-aw-') !== 0) continue;
      var key = a.name.slice(8).replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); });
      opts[key] = parseValue(a.value);
    }
    return opts;
  }

  var AW = {
    reduced: reduced,
    isMobile: isMobile,
    lenis: null,
    modules: modules,

    /* 预载完成信号：preloader 模块会接管；没有预载时页面就绪即完成 */
    loaded: null,
    _resolveLoaded: null,
    holdLoad: function () { AW._held = true; },
    releaseLoad: function () { if (AW._resolveLoaded) AW._resolveLoaded(); },

    register: function (name, fn) {
      modules[name] = fn;
      if (AW._ready) AW.mount(document);
    },

    mount: function (root) {
      var els = (root || document).querySelectorAll('[data-aw]');
      els.forEach(function (el) {
        el._awDone = el._awDone || {};
        el.getAttribute('data-aw').split(/\s+/).forEach(function (name) {
          if (!name || el._awDone[name] || !modules[name]) return;
          el._awDone[name] = true;
          try {
            var cleanup = modules[name](el, readOpts(el), AW.ctx);
            mounted.push({ el: el, name: name, cleanup: cleanup });
          } catch (err) {
            console.warn('[aw] module "' + name + '" failed:', err);
          }
        });
      });
      if (window.ScrollTrigger) ScrollTrigger.refresh();
    },

    destroy: function () {
      mounted.forEach(function (m) { if (typeof m.cleanup === 'function') m.cleanup(); });
      mounted = [];
    },

    /* 工具：把 0–1 的进度映射到区间 */
    map: function (p, a, b) { return a + (b - a) * p; },
    clamp: function (v, a, b) { return Math.max(a, Math.min(b, v)); }
  };

  function start() {
    if (AW._started) return;
    AW._started = true;
    var html = document.documentElement;
    html.classList.add('aw-js');
    if (reduced) html.classList.add('aw-reduced');

    if (!window.gsap) {
      console.warn('[aw] GSAP not loaded — page stays static.');
      html.classList.add('aw-static');
      html.classList.remove('aw-js');
      AW.releaseLoad();
      return;
    }
    var plugins = [window.ScrollTrigger, window.SplitText].filter(Boolean);
    gsap.registerPlugin.apply(gsap, plugins);
    gsap.defaults({ ease: 'expo.out', duration: 1.2 });

    if (window.Lenis && !reduced) {
      var lenis = new Lenis({ lerp: 0.1, wheelMultiplier: 1, smoothWheel: true });
      AW.lenis = lenis;
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
      /* 锚点链接走 Lenis */
      document.addEventListener('click', function (e) {
        var a = e.target.closest('a[href^="#"]');
        if (!a || a.getAttribute('href').length < 2) return;
        var target = document.querySelector(a.getAttribute('href'));
        if (!target) return;
        e.preventDefault();
        lenis.scrollTo(target, { duration: 1.4 });
      });
    }

    AW.ctx = { gsap: gsap, ScrollTrigger: window.ScrollTrigger, lenis: AW.lenis, reduced: reduced, isMobile: isMobile };

    var go = function () {
      AW._ready = true;
      AW.mount(document);
      html.classList.add('aw-ready');
      document.dispatchEvent(new CustomEvent('aw:ready'));
      if (!AW._held) AW.releaseLoad();
    };
    /* 等字体就绪再拆字/测量，避免布局跳动 */
    if (document.fonts && document.fonts.ready) {
      Promise.race([document.fonts.ready, new Promise(function (r) { setTimeout(r, 1500); })]).then(go);
    } else {
      go();
    }

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () { ScrollTrigger.refresh(); }, 200);
    });
  }

  AW.loaded = new Promise(function (r) { AW._resolveLoaded = r; });
  window.AW = AW;
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
