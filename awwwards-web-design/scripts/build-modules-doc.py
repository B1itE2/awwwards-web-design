#!/usr/bin/env python3
"""Regenerate references/modules.md from module header comments + the notes below.
Run after adding or changing a module:  python3 scripts/build-modules-doc.py
"""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
MODULES = ROOT / "assets" / "modules"
OUT = ROOT / "references" / "modules.md"

# name: (category, when to use / limits)
NOTES = {
    "reveal":        ("文字", "所有标题和重要段落的进场。首屏标题加 data-aw-on=\"load\"。一屏只用一次。"),
    "preloader":     ("进场", "整站一次。品牌感强的页面用；工具/文档类页面不用。"),
    "steps":         ("叙事", "4–6 条并列内容逐条讲（议程、原则、服务）。内容是大字时效果最好。"),
    "clock":         ("实物", "主题和时间有关：营业时间、活动日程、一天的故事。每页最多一个实物模块。"),
    "odometer":      ("实物", "一个有意义的年份或数字随滚动转出来（成立年份、里程、人数）。"),
    "rotate":        ("实物", "唱片、齿轮、罗盘、徽章等圆形物件随滚动转动。"),
    "counter":       ("数字", "成绩/规模数字，一屏 2–4 个，配 Meta 标签。"),
    "marquee":       ("装饰", "日期、口号、客户名的横向跑马灯。每页最多 1–2 条。"),
    "cursor":        ("交互", "挂在 <body>。几乎所有页面都可以用；触摸屏自动关闭。"),
    "magnetic":      ("交互", "主要 CTA 按钮、圆形按钮。不要给所有链接加。"),
    "scribble":      ("交互", "需要被注意的一个链接或当前项（编辑型最合适）。"),
    "hover-swap":    ("交互", "导航和文字链接悬停时换成衬线斜体。适合编辑型。"),
    "hover-preview": ("交互", "作品/菜单/产地列表，悬停出图。列表 4–10 行。"),
    "parallax":      ("图片", "大图的轻微视差。速度 0.1–0.3，不要更大。"),
    "img-reveal":    ("图片", "图片进入视口时裁切打开。一屏最多一张。"),
    "hero-cycle":    ("图片", "首屏巨字固定、背景图/视频轮换。需要 3–5 张高质量大图。"),
    "hscroll":       ("布局", "钉住后横向浏览一组卡片（嘉宾、作品、产品）。手机端自动变成横滑。"),
    "drag-gallery":  ("布局", "可拖拽的一行图片，比 hscroll 更自由，适合画廊。"),
    "theme":         ("布局", "章节换色。整页 1–3 个深色章节，制造节奏。"),
    "menu":          ("导航", "全屏菜单。按钮放在四角 UI 的右上角。"),
    "fit-text":      ("文字", "页脚巨型字标撑满宽度，或首屏一个单词撑满。"),
    "arc-text":      ("文字", "沿圆弧排列的短句徽章（10–40 个字符），放在图片或标题旁。"),
    "dot-matrix":    ("文字", "点阵字标，鼠标扰动。一个短单词（3–8 个字母），适合科技/产品感。"),
}

ORDER = ["文字", "进场", "叙事", "图片", "布局", "交互", "数字", "实物", "装饰", "导航"]


def header(path):
    text = path.read_text(encoding="utf-8")
    m = re.match(r"/\*!(.*?)\*/", text, re.S)
    if not m:
        return "", ""
    lines = [re.sub(r"^\s*\* ?", "", l) for l in m.group(1).strip().splitlines()]
    title = lines[0].split("—", 1)[-1].strip() if lines else ""
    body = "\n".join(lines[1:]).strip()
    return title, body


def main():
    names = sorted(p.stem for p in MODULES.glob("*.js"))
    missing = [n for n in names if n not in NOTES]
    if missing:
        raise SystemExit(f"Add NOTES for: {', '.join(missing)}")

    out = [
        "# 模块目录",
        "",
        "由 `scripts/build-modules-doc.py` 根据各模块文件头注释生成，不要手改；改模块注释或脚本里的 NOTES 后重新生成。",
        "",
        "挂载方式：`<div data-aw=\"模块名\" data-aw-参数=\"值\">`。多个模块用空格分隔。",
        "所有模块在 `prefers-reduced-motion` 下直接显示最终状态；鼠标交互类在触摸屏上自动关闭。",
        "",
        "| 模块 | 类别 | 作用 | 什么时候用 |",
        "|---|---|---|---|",
    ]
    by_cat = sorted(names, key=lambda n: (ORDER.index(NOTES[n][0]), n))
    for n in by_cat:
        title, _ = header(MODULES / f"{n}.js")
        out.append(f"| [`{n}`](#{n}) | {NOTES[n][0]} | {title} | {NOTES[n][1]} |")
    out.append("")
    for n in by_cat:
        title, body = header(MODULES / f"{n}.js")
        out += [f"## {n}", "", f"**{title}**　{NOTES[n][1]}", "", "```", body, "```", ""]
    OUT.write_text("\n".join(out), encoding="utf-8")
    print(f"wrote {OUT.relative_to(ROOT)} ({len(names)} modules)")


if __name__ == "__main__":
    main()
