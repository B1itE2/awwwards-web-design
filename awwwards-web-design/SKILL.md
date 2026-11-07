---
name: awwwards-web-design
description: Build minimal, high-end, Awwwards-style web pages (landing pages, portfolios, brand sites, event pages, product pages) with big typography, restrained color, smooth scroll and scroll-driven motion. Use when the user asks for a 高级感 / 简约 / 获奖级 / Awwwards 风格 / 有动效的 webpage, landing page, 官网, 作品集, or wants a page to look "like an award-winning site". Outputs a self-contained static site (HTML + CSS + JS, works offline).
---

# Awwwards-style web pages

You build static sites that look like Awwwards Site-of-the-Day winners. Quality comes from three things, in this order: **typography and layout rules**, **restraint**, then **motion**. Motion on top of a weak layout still looks like a template.

Everything you need ships with this skill:
- `references/design-system.md` — the hard rules (type scale, color, grid, corners, motion). **Read it before writing any HTML.**
- `references/archetypes.md` — complete style recipes. Pick one per page.
- `references/modules.md` — every effect module: HTML snippet, options, when to use.
- `references/checklist.md` — the pre-delivery review.
- `scripts/new-site.sh` — creates the project folder with the right files.
- `assets/examples/` — one finished page per archetype. Open one to see the standard.

## Workflow

### 1. Brief (ask, don't guess)

If the user hasn't said, ask in one message, max 4 questions:
- What is it for, and who visits? (brand / product / portfolio / event / shop…)
- The one sentence the page must get across.
- Real content they have: name, copy, images, logo, brand color. Anything missing you will write or placeholder.
- A style preference, or a site they like. Offer the archetypes by name with a one-line description each.

If the user says "just do it", choose for them and state your choices in one line.

### 2. Choose an archetype

Read `references/archetypes.md` and pick one. Map user words:
| User says | Archetype |
|---|---|
| 海报感 / 大字 / 黑白 / 设计感 / 展览 / 活动 / 字体 | 海报排版型 `poster` |
| 杂志感 / 优雅 / 品牌故事 / 咖啡 / 酒店 / 生活方式 / 衬线 | 编辑叙事型 `editorial` |
| 网店 / 商品 / 产品线 / 系列 / 目录 / 换装 / 电影或专辑合集 / 器物 | 商品展示型 `showcase` |

If none fits well, pick the closer one and adapt color and fonts within its rules. Never mix two archetypes on one page.

### 3. Write the storyboard before code

Write a short list, one line per screen (100vh):

```
01 Hero      — mega type "SLOW HOURS" + meta line; reveal on load
02 Intro     — mixed-type sentence, 7–12 cols; reveal lines
03 Chapter   — dark theme section, arc badge rotating
…
```

Rules: 6–9 screens. One idea per screen. Each screen names its single protagonist (a sentence, an image, or an object). Assign modules here, not while coding. Use at most one "physical object" module (clock / odometer / rotate) and at most one pinned showcase (disc-carousel) and one ink-reveal per page, and only if it fits the subject (a café's opening hours → clock).

Write real copy, in the user's language, short. No lorem ipsum, no 赋能 / 一站式 / 极致体验. Display lines: 1–4 words.

### 4. Scaffold

```bash
bash <skill-dir>/scripts/new-site.sh <target-dir> <module> <module> ...
```

This copies CSS, the runtime, vendored libraries, fonts, and only the modules you list, and writes an `index.html` with the script tags in place. Then you fill in the `<style>` block and replace `<!-- CONTENT -->`.

### 5. Build

- Set the archetype's tokens in `<style>` (`:root { --bg; --ink; --accent; --font-display … }`).
- Use the utility classes from `aw-base.css`: `.t-mega .t-display .t-title .t-body .t-meta`, `.grid` + `.c-{start}-{end}`, `.section .screen .wrap`, `.corners`.
- Attach motion with `data-aw="module"` and `data-aw-*` options (see `references/modules.md`). Several modules on one element: `data-aw="reveal parallax"`.
- Images: use the user's. If none, use solid color or simple SVG blocks in the palette, labeled in a comment as placeholders. Do not hotlink stock photos.
- Keep page-specific CSS under ~150 lines. If you need more, the layout is too complicated.

### 6. Review

Go through `references/checklist.md` line by line. If you can run a headless browser, use `scripts/shoot.mjs` to screenshot desktop and mobile and look at them. Fix what fails, then report to the user: archetype, the storyboard, which modules are used, and what is placeholder.

## Don'ts

- Don't center-stack a hero (big title + subtitle + two buttons). That is the #1 template tell.
- Don't animate everything. Each screen gets at most one entrance effect plus the global ones (cursor, smooth scroll).
- Don't add colors. 2 + 1 per screen (bg, ink, one accent).
- Don't write mid-size headings everywhere (24–32px). Sizes are huge or small.
- Don't load libraries from CDNs; everything is local.
- Don't copy a real site's layout, copy, or assets. The archetypes are distilled patterns; use them to make something original.
