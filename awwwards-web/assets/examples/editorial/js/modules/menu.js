/*!
 * menu — 全屏菜单裁切展开，链接逐行遮罩升起
 * 用法：
 *   <button data-aw="menu" data-aw-target="#menu">Menu</button><nav id="menu"><a>…</a></nav>
 *   data-aw-target         必填，菜单容器选择器
 *   data-aw-stagger="0.06"  菜单链接升起间隔（秒）
 * 打开后锁定 Lenis、焦点移至首个链接；Esc、再次点击或锚点跳转会关闭并还原本按钮焦点。
 */
AW.register('menu', function (el, o, ctx) {
  var gsap = ctx.gsap;
  if (!o.target) return function () {};
  var nav = document.querySelector(o.target);
  if (!nav) return function () {};
  var stagger = o.stagger != null ? o.stagger : 0.06;
  var buttonHTML = el.innerHTML;
  var buttonExpanded = el.getAttribute('aria-expanded');
  var navStyle = nav.style.cssText;
  var navHidden = nav.getAttribute('aria-hidden');
  var links = nav.querySelectorAll('a');
  var linkHTML = [], linkStyles = [], inners = [];
  var open = false, tl = null;
  var token = {};
  AW._menuLocks = AW._menuLocks || [];

  for (var i = 0; i < links.length; i++) {
    linkHTML.push(links[i].innerHTML);
    linkStyles.push({ display: links[i].style.display, overflow: links[i].style.overflow });
    var inner = document.createElement('span');
    inner.innerHTML = linkHTML[i];
    inner.style.display = 'block';
    links[i].innerHTML = '';
    links[i].style.display = 'block';
    links[i].style.overflow = 'hidden';
    links[i].appendChild(inner);
    inners.push(inner);
  }
  el.setAttribute('aria-expanded', 'false');
  nav.setAttribute('aria-hidden', 'true');
  nav.style.position = 'fixed';
  nav.style.inset = '0';
  nav.style.zIndex = '45';  /* 低于四角 UI（50），Close 按钮保持可点 */
  nav.style.overflow = 'auto';
  nav.style.backgroundColor = 'var(--bg)';
  nav.style.color = 'var(--ink)';
  nav.style.visibility = 'hidden';
  nav.style.pointerEvents = 'none';
  gsap.set(nav, { clipPath: 'inset(0 0 100% 0)' });
  gsap.set(inners, { yPercent: 110 });

  function syncLenis() {
    if (!ctx.lenis) return;
    var index = AW._menuLocks.indexOf(token);
    if (open && index === -1) AW._menuLocks.push(token);
    if (!open && index !== -1) AW._menuLocks.splice(index, 1);
    if (AW._menuLocks.length) ctx.lenis.stop();
    else ctx.lenis.start();
  }

  if (!ctx.reduced) {
    tl = gsap.timeline({
      paused: true,
      onComplete: function () {
        if (open && links[0]) links[0].focus();
      },
      onReverseComplete: function () {
        nav.style.visibility = 'hidden';
        nav.style.pointerEvents = 'none';
      }
    });
    tl.fromTo(nav, { clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0% 0 0% 0)', duration: 0.9, ease: 'expo.out' }, 0);
    tl.fromTo(inners, { yPercent: 110 }, { yPercent: 0, duration: 0.85, ease: 'expo.out', stagger: stagger }, 0.18);
  }

  function show() {
    if (open) return;
    open = true;
    el.textContent = 'Close';
    el.setAttribute('aria-expanded', 'true');
    nav.setAttribute('aria-hidden', 'false');
    nav.style.visibility = 'visible';
    nav.style.pointerEvents = 'auto';
    syncLenis();
    if (tl) {
      if (tl.progress() === 0) {
        gsap.set(nav, { clipPath: 'inset(0 0 100% 0)' });
        gsap.set(inners, { yPercent: 110 });
        tl.play(0);
      } else tl.play();
    } else {
      gsap.set(nav, { clipPath: 'inset(0% 0 0% 0)' });
      gsap.set(inners, { yPercent: 0 });
      if (links[0]) links[0].focus();
    }
  }

  function hide(restoreFocus) {
    if (!open) return;
    open = false;
    el.textContent = 'Menu';
    el.setAttribute('aria-expanded', 'false');
    nav.setAttribute('aria-hidden', 'true');
    nav.style.pointerEvents = 'none';
    syncLenis();
    if (tl) tl.reverse();
    else {
      gsap.set(nav, { clipPath: 'inset(0 0 100% 0)' });
      gsap.set(inners, { yPercent: 110 });
      nav.style.visibility = 'hidden';
    }
    if (restoreFocus !== false) el.focus();
  }

  function onClick() { if (open) hide(true); else show(); }
  function onKey(e) { if (e.key === 'Escape' && open) hide(true); }
  function onNavClick(e) {
    var link = e.target.closest ? e.target.closest('a[href^="#"]') : null;
    if (link && nav.contains(link)) hide(true);
  }

  el.addEventListener('click', onClick);
  document.addEventListener('keydown', onKey);
  nav.addEventListener('click', onNavClick);

  return function () {
    open = false;
    syncLenis();
    el.removeEventListener('click', onClick);
    document.removeEventListener('keydown', onKey);
    nav.removeEventListener('click', onNavClick);
    if (tl) tl.kill();
    for (var i = 0; i < links.length; i++) {
      links[i].innerHTML = linkHTML[i];
      links[i].style.display = linkStyles[i].display;
      links[i].style.overflow = linkStyles[i].overflow;
    }
    el.innerHTML = buttonHTML;
    if (buttonExpanded == null) el.removeAttribute('aria-expanded');
    else el.setAttribute('aria-expanded', buttonExpanded);
    nav.style.cssText = navStyle;
    if (navHidden == null) nav.removeAttribute('aria-hidden');
    else nav.setAttribute('aria-hidden', navHidden);
  };
});
