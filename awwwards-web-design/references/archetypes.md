# 风格配方

每页只选一种。配方里的数值是默认值，可以在规则内微调（换强调色、换同类字体），不要跨配方混用。

---

## poster — 海报排版型

**参照气质**：FORMAT、Grids（Obys）、MECHA。字就是画面，黑白为主，滚动时版面像海报一样被重新编排。

**适合**：设计/艺术活动、展览、字体或设计工作室、发布会、个人作品集、音乐活动。

### 配色（选一套）

| 名称 | --bg | --ink | --accent |
|---|---|---|---|
| 纸白 | `#f2f1ee` | `#141413` | `#e8492b` 朱红 |
| 炭黑 | `#151514` | `#ecebe6` | `#d7ff3a` 荧光黄绿 |
| 冷灰 | `#d9d9d6` | `#111111` | `#2b4cff` 克莱因蓝 |

整页可以用 `theme` 模块在纸白和炭黑之间切换 1–2 次，强调色不变。

### 字体

- Display：`"Archivo", sans-serif`，字重 800，大写，字距 `-0.05em`
- Body：`"Inter"`；Meta：`"JetBrains Mono"`，大写
- 中文标题：苹方/思源黑体 Heavy，字距 `-0.02em`

### 版式特征

- 首屏：`.t-mega` 巨字 2–3 行撑满宽度，左下或底部对齐；一行 Meta 说明在字的上方或角落。
- 大量使用 12 栏的错位：正文放在第 7–12 栏，标签放在第 1–3 栏。
- 细分隔线 `.rule` 和编号 `(01)`、`[02]` 构成"信息感"。
- 几何形状（圆、方块、三角）可以作为图形元素，颜色只用 ink 或 accent。
- 页脚：`fit-text` 巨型字标撑满宽度。

### 推荐分镜

```
01 预载        preloader（百分比）
02 首屏        t-mega 巨字（reveal on=load）+ 四角 UI
03 宣言        一句 t-title（reveal words），留白 40vh
04 跑马灯      日期/口号 marquee
05 议程        steps：4–6 条，未激活压暗
06 实物        clock（活动时间）或 odometer（年份/数字）
07 横滚        hscroll：嘉宾/作品卡片
08 数字        counter ×3，Meta 标签
09 页脚        fit-text 字标 + 联系方式
```

### 模块组合

必选：`reveal` `preloader` `cursor` `menu`
常用：`steps` `marquee` `hscroll` `fit-text` `counter` `theme`
实物（选 0–1）：`clock` `odometer` `rotate`

### 容易做坏的地方

- 巨字不够大：首屏巨字至少占视口高度的 60%。
- 太多灰阶：只用 ink 和 ink 的 55% 透明度，不要再加灰色。
- 用了圆角：这一型几乎不用圆角（`border-radius: 0`），几何圆形除外。

---

## editorial — 编辑叙事型

**参照气质**：A24、Grail、Era Residence、Signal-A。像一本可以滚动的杂志：衬线大字、章节换色、照片和文字交替。

**适合**：咖啡馆/餐厅/酒店、生活方式品牌、文化机构、品牌故事页、高端服务、写作/摄影作品集。

### 配色（选一套）

| 名称 | --bg | --ink | --accent |
|---|---|---|---|
| 米纸 | `#efe9df` | `#1c1a17` | `#b5532e` 赭石 |
| 暖灰 | `#e6e3dc` | `#22201c` | `#2f4b3a` 墨绿 |
| 酒红夜 | `#2a0f19` | `#f3e8dc` | `#e9b44c` 琥珀 |

章节换色：在米纸/暖灰章节之间插入一个深色章节（酒红夜或 `#1c1a17` 底），用 `theme` 模块。

### 字体

- Display：`"Instrument Serif", serif`，字重 400，标题可全大写，字距 `-0.02em`，行高 `0.95`
- Body：`"Inter"`；Meta：`"JetBrains Mono"` 或 Inter 大写 + 字距 `0.08em`
- 句内强调：`<em>` 衬线斜体（`mixed-type.css` 已处理），`<i class="script">` 手写体，每页最多 2 处
- 中文标题：宋体（Songti SC / 思源宋体），字距 `0`

### 版式特征

- 首屏：衬线大字居左或分散在画面两侧（Grail、A24 的做法），一张竖图或横图在侧；不要居中堆叠。
- 句子里混用字体：一个关键词换成衬线斜体，其余保持无衬线。这是这一型最便宜的高级感。
- 图片比例 `4/5` 为主，配 `img-reveal` 或 `parallax`。
- 章节号用 `Chapter 01` 或 `( I )` 罗马数字。
- 一处弧形文字徽章（`arc-text`）可以放在图片角上，滚动时慢慢旋转。
- 列表（菜单、产地、作品）用细线分隔，悬停出图（`hover-preview`）。

### 推荐分镜

```
01 首屏        衬线大字（reveal lines on=load）+ 一张 4/5 竖图（img-reveal）
02 引言        混排句子 t-title，第 2–11 栏
03 图文        大图 parallax + 侧栏小字说明
04 深色章节    theme 换深底：一句大字 + arc-text 徽章
05 列表        hover-preview 列表（产地 / 菜单 / 作品）
06 实物        clock（营业时间）可选
07 引语        一段引语 + 署名（Meta）
08 预约        一个 scribble 链接（"Book a table"）
09 页脚        fit-text 衬线字标 + 地址
```

### 模块组合

必选：`reveal` `img-reveal` `theme` `cursor`
常用：`parallax` `hover-preview` `arc-text` `hover-swap` `scribble` `fit-text` `menu`
实物（选 0–1）：`clock` `rotate`

### 容易做坏的地方

- 衬线字太粗或用了 Playfair 粗体：保持 400 字重，靠尺寸而不是粗细。
- 每张图都加动效：一屏最多一张图有进场动画。
- 暖色叠暖色：米纸底配赭石已经够暖，照片不要再加暖色滤镜。
