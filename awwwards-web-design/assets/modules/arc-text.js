/*!
 * arc-text — 文字沿 SVG 圆弧等距排列，滚动时整圈缓慢旋转
 * 用法：
 *   <div data-aw="arc-text" data-aw-radius="160" data-aw-arc="360">ROUND TEXT</div>
 *   data-aw-radius="160"  圆弧半径 px
 *   data-aw-arc="360"     弧度角度，360 为整圈
 *   data-aw-spin="90"     滚过该区域旋转的度数，0 为不旋转
 *   data-aw-size="14"     字号 px
 * 原文字写入 aria-label，SVG 对屏幕阅读器隐藏。
 */
AW.register('arc-text', function (el, o, ctx) {
  var gsap = ctx.gsap;
  var radius = o.radius != null ? o.radius : 160;
  var arc = Math.max(0, Math.min(360, o.arc != null ? o.arc : 360));
  var spin = o.spin != null ? o.spin : 90;
  var size = o.size != null ? o.size : 14;
  var text = el.textContent.replace(/^\s+|\s+$/g, '');
  var originalHTML = el.innerHTML;
  var originalLabel = el.getAttribute('aria-label');
  var NS = 'http://www.w3.org/2000/svg';
  var id = 'aw-arc-' + Math.random().toString(36).slice(2);
  var pad = size * 2;
  var dimension = (radius + pad) * 2;
  var tween = null;

  function node(name) { return document.createElementNS(NS, name); }
  function point(angle) {
    var rad = angle * Math.PI / 180;
    return [Math.cos(rad) * radius, Math.sin(rad) * radius];
  }

  var startAngle = -90 - arc / 2;
  var start = point(startAngle);
  var pathData;
  if (arc === 360) {
    var middle = point(startAngle + 180);
    pathData = 'M ' + start[0] + ' ' + start[1] +
      ' A ' + radius + ' ' + radius + ' 0 1 1 ' + middle[0] + ' ' + middle[1] +
      ' A ' + radius + ' ' + radius + ' 0 1 1 ' + start[0] + ' ' + start[1];
  } else {
    var end = point(startAngle + arc);
    pathData = 'M ' + start[0] + ' ' + start[1] +
      ' A ' + radius + ' ' + radius + ' 0 ' + (arc > 180 ? 1 : 0) + ' 1 ' + end[0] + ' ' + end[1];
  }

  var svg = node('svg');
  svg.setAttribute('viewBox', (-radius - pad) + ' ' + (-radius - pad) + ' ' + dimension + ' ' + dimension);
  svg.setAttribute('width', dimension);
  svg.setAttribute('height', dimension);
  svg.setAttribute('aria-hidden', 'true');
  svg.style.display = 'block';
  svg.style.overflow = 'visible';
  var defs = node('defs');
  var path = node('path');
  path.setAttribute('id', id);
  path.setAttribute('d', pathData);
  path.setAttribute('fill', 'none');
  defs.appendChild(path);
  svg.appendChild(defs);

  var style = window.getComputedStyle(el);
  var textNode = node('text');
  textNode.style.fill = 'var(--ink)';
  textNode.setAttribute('font-size', size);
  textNode.setAttribute('font-family', style.fontFamily);
  textNode.setAttribute('font-weight', style.fontWeight);
  textNode.setAttribute('text-anchor', 'middle');
  textNode.setAttribute('textLength', radius * arc * Math.PI / 180);
  textNode.setAttribute('lengthAdjust', 'spacing');
  var textPath = node('textPath');
  textPath.setAttribute('href', '#' + id);
  textPath.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', '#' + id);
  textPath.setAttribute('startOffset', '50%');
  textPath.setAttribute('textLength', radius * arc * Math.PI / 180);
  textPath.setAttribute('lengthAdjust', 'spacing');
  textPath.textContent = text;
  textNode.appendChild(textPath);
  svg.appendChild(textNode);
  el.setAttribute('aria-label', text);
  el.textContent = '';
  el.appendChild(svg);

  if (!ctx.reduced && spin !== 0) {
    tween = gsap.fromTo(svg, { rotation: 0 }, {
      rotation: spin,
      transformOrigin: '50% 50%',
      ease: 'none',
      scrollTrigger: {
        trigger: el,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true
      }
    });
  }

  return function () {
    if (tween) {
      if (tween.scrollTrigger) tween.scrollTrigger.kill();
      tween.kill();
    }
    el.innerHTML = originalHTML;
    if (originalLabel == null) el.removeAttribute('aria-label');
    else el.setAttribute('aria-label', originalLabel);
  };
});
