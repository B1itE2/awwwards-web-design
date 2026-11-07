# 模块目录

由 `scripts/build-modules-doc.py` 根据各模块文件头注释生成，不要手改；改模块注释或脚本里的 NOTES 后重新生成。

挂载方式：`<div data-aw="模块名" data-aw-参数="值">`。多个模块用空格分隔。
所有模块在 `prefers-reduced-motion` 下直接显示最终状态；鼠标交互类在触摸屏上自动关闭。

| 模块 | 类别 | 作用 | 什么时候用 |
|---|---|---|---|
| [`arc-text`](#arc-text) | 文字 | 文字沿 SVG 圆弧等距排列，滚动时整圈缓慢旋转 | 沿圆弧排列的短句徽章（10–40 个字符），放在图片或标题旁。 |
| [`dot-matrix`](#dot-matrix) | 文字 | Canvas 点阵字标，鼠标附近的点被推开并弹回 | 点阵字标，鼠标扰动。一个短单词（3–8 个字母），适合科技/产品感。 |
| [`fit-text`](#fit-text) | 文字 | 文字自动缩放到正好撑满容器宽度 | 页脚巨型字标撑满宽度，或首屏一个单词撑满。 |
| [`reveal`](#reveal) | 文字 | 文字/元素进场 | 所有标题和重要段落的进场。首屏标题加 data-aw-on="load"。一屏只用一次。 |
| [`preloader`](#preloader) | 进场 | 进场仪式：百分比计数，完成后升起离开 | 整站一次。品牌感强的页面用；工具/文档类页面不用。 |
| [`steps`](#steps) | 叙事 | 钉住章节 + 逐条叙事（未激活条目压暗） | 4–6 条并列内容逐条讲（议程、原则、服务）。内容是大字时效果最好。 |
| [`hero-cycle`](#hero-cycle) | 图片 | 首屏巨字固定，背景图片/视频交叉淡入并缓慢缩放 | 首屏巨字固定、背景图/视频轮换。需要 3–5 张高质量大图。 |
| [`img-reveal`](#img-reveal) | 图片 | 图片以 inset() 裁切揭示，同时从放大状态归位 | 图片进入视口时裁切打开。一屏最多一张。 |
| [`parallax`](#parallax) | 图片 | 随页面滚动产生不同速度的纵向视差 | 大图的轻微视差。速度 0.1–0.3，不要更大。 |
| [`disc-carousel`](#disc-carousel) | 展示 | 钉住区块，一排倾斜的光盘随滚动斜向滚过并自转，当前光盘被手绘圈线圈住 | 一组 4–10 个封面（电影、专辑、作品集）逐个滚过。需要方形封面图；整页只用一次，占一整屏。 |
| [`float-cards`](#float-cards) | 展示 | 一组卡片悬浮在 3D 空间里缓慢漂动，鼠标带动景深视差，往下滚时卡片朝镜头飞散 | 首屏氛围：6–16 张小卡片或图块漂在主标题下方。深色背景效果最好，卡片别太大。 |
| [`outfit-switch`](#outfit-switch) | 展示 | 商品换装轮播：主角居中，后面几套在左侧排队渐小渐糊，右侧配件栏随之上滑替换 | 同一位置轮换 3–8 套商品/造型，右侧列出配件。主角图最好是透明底 PNG。 |
| [`drag-gallery`](#drag-gallery) | 布局 | 横向拖拽画廊，惯性滑行并在边缘阻尼回弹 | 可拖拽的一行图片，比 hscroll 更自由，适合画廊。 |
| [`hscroll`](#hscroll) | 布局 | 区块钉住后将纵向滚动转换为一行卡片的横向位移 | 钉住后横向浏览一组卡片（嘉宾、作品、产品）。手机端自动变成横滑。 |
| [`theme`](#theme) | 布局 | 章节经过视口中线时平滑切换整页 CSS 颜色变量 | 章节换色。整页 1–3 个深色章节，制造节奏。 |
| [`cursor`](#cursor) | 交互 | 带缓动跟随与悬停文字的自定义光标 | 挂在 <body>。几乎所有页面都可以用；触摸屏自动关闭。 |
| [`hover-preview`](#hover-preview) | 交互 | 作品列表悬停出图，预览图缓动跟随并裁切换图 | 作品/菜单/产地列表，悬停出图。列表 4–10 行。 |
| [`hover-swap`](#hover-swap) | 交互 | 悬停时文字上下滚动，从无衬线切换为衬线斜体 | 导航和文字链接悬停时换成衬线斜体。适合编辑型。 |
| [`magnetic`](#magnetic) | 交互 | 鼠标靠近时吸附、离开时弹性回位的磁吸元素 | 主要 CTA 按钮、圆形按钮。不要给所有链接加。 |
| [`scribble`](#scribble) | 交互 | 悬停或聚焦时绘制不规则手绘椭圆，离开时反向擦除 | 需要被注意的一个链接或当前项（编辑型最合适）。 |
| [`counter`](#counter) | 数字 | 进入视口后播放一次的数字计数 | 成绩/规模数字，一屏 2–4 个，配 Meta 标签。 |
| [`clock`](#clock) | 实物 | 滚动驱动的表盘（实物隐喻） | 主题和时间有关：营业时间、活动日程、一天的故事。每页最多一个实物模块。 |
| [`odometer`](#odometer) | 实物 | 滚动驱动的里程表：每位数字是竖向滚轮，连续滚动，进位时高位一起转 | 一个有意义的年份或数字随滚动转出来（成立年份、里程、人数）。 |
| [`rotate`](#rotate) | 实物 | 通用滚动旋转，适用于唱片、齿轮、罗盘等实物隐喻 | 唱片、齿轮、罗盘、徽章等圆形物件随滚动转动。 |
| [`marquee`](#marquee) | 装饰 | 无缝横向跑马灯，滚动页面时加速并跟随滚动方向 | 日期、口号、客户名的横向跑马灯。每页最多 1–2 条。 |
| [`menu`](#menu) | 导航 | 全屏菜单裁切展开，链接逐行遮罩升起 | 全屏菜单。按钮放在四角 UI 的右上角。 |

## arc-text

**文字沿 SVG 圆弧等距排列，滚动时整圈缓慢旋转**　沿圆弧排列的短句徽章（10–40 个字符），放在图片或标题旁。

```
用法：
  <div data-aw="arc-text" data-aw-radius="160" data-aw-arc="360">ROUND TEXT</div>
  data-aw-radius="160"  圆弧半径 px
  data-aw-arc="360"     弧度角度，360 为整圈
  data-aw-spin="90"     滚过该区域旋转的度数，0 为不旋转
  data-aw-size="14"     字号 px
原文字写入 aria-label，SVG 对屏幕阅读器隐藏。
```

## dot-matrix

**Canvas 点阵字标，鼠标附近的点被推开并弹回**　点阵字标，鼠标扰动。一个短单词（3–8 个字母），适合科技/产品感。

```
用法：
  <div data-aw="dot-matrix" data-aw-text="opal" data-aw-gap="8">opal</div>
  data-aw-text           必填，要绘制的单词
  data-aw-gap="8"        点间距 px
  data-aw-dot="1.6"      点半径 px
  data-aw-radius="90"    鼠标影响半径 px
  data-aw-font           字体，默认取元素 font-family，粗细 800
使用 devicePixelRatio 清晰绘制；仅进入视口时运行循环，触摸/reduced 显示静态点阵。
```

## fit-text

**文字自动缩放到正好撑满容器宽度**　页脚巨型字标撑满宽度，或首屏一个单词撑满。

```
用法：
  <div data-aw="fit-text" data-aw-max="240" data-aw-reveal="true">BRAND</div>
  data-aw-max            最大字号 px，默认无上限
  data-aw-reveal="true"  进入视口时逐字升起，默认 true
仅在初始化、字体就绪及 ResizeObserver 回调中设置 font-size，不做字号动画。
```

## reveal

**文字/元素进场**　所有标题和重要段落的进场。首屏标题加 data-aw-on="load"。一屏只用一次。

```
用法：
  <h1 data-aw="reveal" data-aw-split="lines">…</h1>   逐行遮罩升起（默认）
  <h1 data-aw="reveal" data-aw-split="chars">…</h1>   逐字升起
  <h1 data-aw="reveal" data-aw-split="words">…</h1>   逐词升起
  <p  data-aw="reveal" data-aw-split="none">…</p>     整块淡入上移
  data-aw-scrub="true"  跟随滚动进度（回滚倒放），默认 false：进入视口播放一次
  data-aw-delay="0.2"   延迟（秒），data-aw-stagger 覆盖默认间隔
  data-aw-start="top 85%"  ScrollTrigger 起点
  data-aw-on="load"     不等滚动，预载结束后立即播放（首屏标题用）
```

## preloader

**进场仪式：百分比计数，完成后升起离开**　整站一次。品牌感强的页面用；工具/文档类页面不用。

```
用法：<div data-aw="preloader" data-aw-min="1.2"></div>
  data-aw-min   最短停留秒数，默认 1.0；最长 2.5 秒强制结束
完成后调用 AW.releaseLoad()，其它 data-aw-on="load" 的动画才会开始。
第二次访问（sessionStorage）直接跳过。
```

## steps

**钉住章节 + 逐条叙事（未激活条目压暗）**　4–6 条并列内容逐条讲（议程、原则、服务）。内容是大字时效果最好。

```
用法：
  <section data-aw="steps" data-aw-distance="300">
    <div class="aw-step">…</div>
    <div class="aw-step">…</div>
  </section>
  data-aw-distance  每条占用的滚动距离（vh），默认 100
每条 .aw-step 依次成为当前项：opacity 1，其余 0.22。
```

## hero-cycle

**首屏巨字固定，背景图片/视频交叉淡入并缓慢缩放**　首屏巨字固定、背景图/视频轮换。需要 3–5 张高质量大图。

```
用法：
  <section data-aw="hero-cycle"><div class="aw-media"><img><video></div><h1>…</h1></section>
  data-aw-interval="3.5"  每张完整展示时长（秒）
  data-aw-duration="1.2"  交叉淡入时长（秒）
视频切入时从头播放、切出时暂停；页面不可见时暂停轮换。
```

## img-reveal

**图片以 inset() 裁切揭示，同时从放大状态归位**　图片进入视口时裁切打开。一屏最多一张。

```
用法：
  <div data-aw="img-reveal" data-aw-from="bottom"><img src="image.jpg" alt=""></div>
  data-aw-from="bottom"  揭示方向：bottom / top / left / right
  data-aw-duration="1.4" 动画时长（秒）
进入视口后只播放一次；目标元素内的 img 从 1.3 倍缩放至 1 倍。
```

## parallax

**随页面滚动产生不同速度的纵向视差**　大图的轻微视差。速度 0.1–0.3，不要更大。

```
用法：
  <div data-aw="parallax" data-aw-speed="0.2"><img src="image.jpg" alt=""></div>
  data-aw-speed="0.2"   视差系数；正数慢于页面，负数反向
  data-aw-scale="1.15" 内部图片的缩放比例，用于避免移动露边
元素内有 img 时移动图片并裁切容器，否则移动元素自身；全程 scrub。
```

## disc-carousel

**钉住区块，一排倾斜的光盘随滚动斜向滚过并自转，当前光盘被手绘圈线圈住**　一组 4–10 个封面（电影、专辑、作品集）逐个滚过。需要方形封面图；整页只用一次，占一整屏。

```
用法：
  <section data-aw="disc-carousel">
    <div class="aw-disc-info"></div>                       可选：左上角信息区，自动放入每张盘的 meta
    <a class="aw-disc" href="/film-a">
      <img src="cover-a.jpg" alt="Film A">                 盘面：一张方图，或任意 HTML
      <div class="aw-disc-meta"><h3>FILM A</h3>…</div>     可选：当前盘时显示在信息区
    </a>
    …
  </section>
  data-aw-step="55"     每张盘占用的滚动距离（vh）
  data-aw-spin="0.35"   每切换一张盘，盘面自转的圈数
  data-aw-tilt-x="16"   盘面前后倾角（度）
  data-aw-tilt-y="-34"  盘面左右倾角（度），负数朝左
  data-aw-color="var(--ink)" 圈线颜色
  data-aw-stroke="0.28" 圈线粗细（相对盘面，0.28 ≈ 2px）
当前盘变化时在 section 上派发 aw:disc 事件，e.detail = { index, disc }，可用来同步页面其他文字。
滚动停下时吸附到最近一张；点侧边的盘会滚到它，点当前盘才打开链接。盘的尺寸用 CSS 变量 --disc-size 调。
```

## float-cards

**一组卡片悬浮在 3D 空间里缓慢漂动，鼠标带动景深视差，往下滚时卡片朝镜头飞散**　首屏氛围：6–16 张小卡片或图块漂在主标题下方。深色背景效果最好，卡片别太大。

```
用法：
  <div data-aw="float-cards">
    <div class="aw-float">卡片内容（图片或 HTML）</div>
    …（6–16 张）
  </div>
  data-aw-spread="1"    分布范围倍数
  data-aw-depth="600"   景深范围（px），越大前后层次越明显
  data-aw-mouse="1"     鼠标视差强度，0 = 关闭
  data-aw-scatter="1"   滚过区块时朝镜头飞散的强度，0 = 关闭
  data-aw-seed="3"      随机种子；换数字得到另一种摆法
卡片尺寸由你的 CSS 决定；给单张卡加 data-aw-x / data-aw-y（-1~1）、data-aw-z（-1~1）可手动定位。
```

## outfit-switch

**商品换装轮播：主角居中，后面几套在左侧排队渐小渐糊，右侧配件栏随之上滑替换**　同一位置轮换 3–8 套商品/造型，右侧列出配件。主角图最好是透明底 PNG。

```
用法：
  <section data-aw="outfit-switch" data-aw-interval="3.2">
    <article class="aw-look">
      <h3>Midnight Magic</h3>                         套装名，显示在左上
      <img src="look-1.png" alt="…">                   主角图：透明底 PNG 最佳
      <ul><li><img src="hat.png" alt=""><span>Wizard hat</span></li>…</ul>   右侧配件 2–4 件
    </article>
    …（3–8 套）
  </section>
  data-aw-interval="3.2"  自动切换秒数，0 = 不自动切换
  data-aw-queue="3"       左侧排队显示几套
点击左侧排队的套装直接切到它；键盘 ← → 切换；鼠标悬停时暂停自动切换；离开视口时暂停。
区块高度用 CSS 变量 --look-h 调（默认 min(78vh, 760px)）。
```

## drag-gallery

**横向拖拽画廊，惯性滑行并在边缘阻尼回弹**　可拖拽的一行图片，比 hscroll 更自由，适合画廊。

```
用法：
  <div data-aw="drag-gallery"><div class="aw-track">…</div></div>
  data-aw-friction="0.92"  惯性衰减系数
  data-aw-edge="0.35"      越界拖拽阻尼
支持鼠标、触摸、横向滚轮/触控板；拖动超过 5px 后阻止子元素点击。
```

## hscroll

**区块钉住后将纵向滚动转换为一行卡片的横向位移**　钉住后横向浏览一组卡片（嘉宾、作品、产品）。手机端自动变成横滑。

```
用法：
  <section data-aw="hscroll" data-aw-speed="1"><div class="aw-track">卡片…</div></section>
  data-aw-speed="1" 滚动距离倍数；实际横向距离为 track 宽度减视口宽度
手机端改为原生横向滑动，不钉住区块；桌面端全程 scrub。
```

## theme

**章节经过视口中线时平滑切换整页 CSS 颜色变量**　章节换色。整页 1–3 个深色章节，制造节奏。

```
用法：
  <section data-aw="theme" data-aw-bg="#111" data-aw-ink="#f2f1ee">…</section>
  data-aw-bg       该章节的 --bg 值，可选
  data-aw-ink      该章节的 --ink 值，可选
  data-aw-accent   该章节的 --accent 值，可选
所有 theme 章节共用一份状态：每次滚动穿过边界时，按"视口中线落在哪个章节"
重新计算目标颜色；不在任何章节内时回到页面原始颜色。相邻章节、回滚都正确。
```

## cursor

**带缓动跟随与悬停文字的自定义光标**　挂在 <body>。几乎所有页面都可以用；触摸屏自动关闭。

```
用法：
  <body data-aw="cursor" data-aw-size="12" data-aw-hover-size="64">
  <a href="/" data-cursor="打开">链接</a>
  data-aw-size="12"        圆点直径 px
  data-aw-hover-size="64" 悬停后的圆点直径 px
  data-aw-lag="0.18"       跟随延迟系数
pointer: coarse 设备不启用；输入框、文本域和可编辑区域保留原生光标。
```

## hover-preview

**作品列表悬停出图，预览图缓动跟随并裁切换图**　作品/菜单/产地列表，悬停出图。列表 4–10 行。

```
用法：
  <ul data-aw="hover-preview" data-aw-lag="0.25"><li data-img="a.jpg">…</li></ul>
  data-aw-lag="0.25"       跟随缓动时长（秒）
  data-aw-width="320"      图片宽度 px
  data-aw-ratio="4/5"     图片宽高比
图片会预加载；预览层不接收指针事件，触摸屏不启用。
```

## hover-swap

**悬停时文字上下滚动，从无衬线切换为衬线斜体**　导航和文字链接悬停时换成衬线斜体。适合编辑型。

```
用法：
  <a data-aw="hover-swap" data-aw-font="var(--font-serif)" data-aw-italic="true">About</a>
  data-aw-font="var(--font-serif)"  替换字体
  data-aw-italic="true"             新文字是否使用斜体
双层均 aria-hidden，原文字保留在 aria-label；触摸屏不启用。
```

## magnetic

**鼠标靠近时吸附、离开时弹性回位的磁吸元素**　主要 CTA 按钮、圆形按钮。不要给所有链接加。

```
用法：
  <button data-aw="magnetic" data-aw-strength="0.35" data-aw-radius="80">按钮</button>
  data-aw-strength="0.35" 鼠标位移传递给元素的比例
  data-aw-radius="80"     元素边界外的触发半径 px
pointer: coarse 设备不启用；离开触发范围后用 elastic.out(1, 0.4) 回位。
```

## scribble

**悬停或聚焦时绘制不规则手绘椭圆，离开时反向擦除**　需要被注意的一个链接或当前项（编辑型最合适）。

```
用法：
  <a href="/" data-aw="scribble" data-aw-color="var(--accent)">链接</a>
  data-aw-color="var(--accent)" 线条颜色
  data-aw-stroke="1.5"          线条宽度
SVG 覆盖在元素外围；描线时长 0.6 秒，不拦截元素自身交互。
```

## counter

**进入视口后播放一次的数字计数**　成绩/规模数字，一屏 2–4 个，配 Meta 标签。

```
用法：
  <span data-aw="counter" data-aw-to="12800" data-aw-suffix="+">0</span>
  data-aw-to             目标数字，必填
  data-aw-from="0"       起始数字
  data-aw-duration="1.6" 动画时长（秒）
  data-aw-decimals="0"   小数位数
  data-aw-separator="," 千位分隔符，传空字符串可关闭
  data-aw-suffix=""      数字后缀
```

## clock

**滚动驱动的表盘（实物隐喻）**　主题和时间有关：营业时间、活动日程、一天的故事。每页最多一个实物模块。

```
用法：
  <div data-aw="clock" data-aw-turns="2" data-aw-from="10:00" data-aw-to="22:00"></div>
  data-aw-turns   滚过该区域时指针转几圈（与 from/to 二选一，turns 优先）
  data-aw-from / data-aw-to   起止时刻 "HH:MM"（12 小时制显示，24 小时数值）
  data-aw-size="320"   直径 px，默认按容器宽度
  data-aw-show-time="true"   在表盘下方显示数字时间
区域：以元素自身为 trigger，从进入视口中线滚到离开底部，全程 scrub。
```

## odometer

**滚动驱动的里程表：每位数字是竖向滚轮，连续滚动，进位时高位一起转**　一个有意义的年份或数字随滚动转出来（成立年份、里程、人数）。

```
用法：
  <div data-aw="odometer" data-aw-from="0" data-aw-to="2026"></div>
  data-aw-from="0"           起始非负整数
  data-aw-to                 目标非负整数，必填
  data-aw-start="top 80%"   ScrollTrigger 起点
  data-aw-end="bottom 20%"  ScrollTrigger 终点
全程 scrub，回滚倒转。个位随数值连续滚动；某位在下一位从 9 滚向 0 的过程中同步转一格，
和机械里程表一致。
```

## rotate

**通用滚动旋转，适用于唱片、齿轮、罗盘等实物隐喻**　唱片、齿轮、罗盘、徽章等圆形物件随滚动转动。

```
用法：
  <div data-aw="rotate" data-aw-turns="1">…</div>
  data-aw-turns="1"             滚过区域时旋转圈数，负数反向
  data-aw-start="top bottom"   ScrollTrigger 起点
  data-aw-end="bottom top"     ScrollTrigger 终点
动画作用于元素自身，scrub 回滚时同步倒转。
```

## marquee

**无缝横向跑马灯，滚动页面时加速并跟随滚动方向**　日期、口号、客户名的横向跑马灯。每页最多 1–2 条。

```
用法：
  <div data-aw="marquee" data-aw-speed="80" data-aw-direction="1">内容…</div>
  data-aw-speed="80"       基础速度，每秒移动的 px 数
  data-aw-direction="1"   初始方向，1 向左、-1 向右
  data-aw-boost="3"       页面滚动时的最大加速倍数
内容不足一屏时自动复制；窗口缩放后重新测量并补足副本。
```

## menu

**全屏菜单裁切展开，链接逐行遮罩升起**　全屏菜单。按钮放在四角 UI 的右上角。

```
用法：
  <button data-aw="menu" data-aw-target="#menu">Menu</button><nav id="menu"><a>…</a></nav>
  data-aw-target         必填，菜单容器选择器
  data-aw-stagger="0.06"  菜单链接升起间隔（秒）
打开后锁定 Lenis、焦点移至首个链接；Esc、再次点击或锚点跳转会关闭并还原本按钮焦点。
```
