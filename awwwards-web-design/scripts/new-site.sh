#!/usr/bin/env bash
# new-site.sh — 生成一个新网页项目骨架
# 用法：bash new-site.sh <目标目录> <模块1> [模块2 ...]
# 例：  bash new-site.sh ./my-site reveal preloader steps clock cursor
# 结果：
#   <目标目录>/index.html        含正确的 CSS/JS 引用，<body> 留空待填
#   <目标目录>/css/              aw-base.css、mixed-type.css
#   <目标目录>/js/               aw-core.js + vendor/ + modules/（只拷贝选中的模块）
#   <目标目录>/fonts/            本地字体
#   <目标目录>/images/           空目录，放图片
set -euo pipefail

SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
A="$SKILL_DIR/assets"

if [ $# -lt 1 ]; then
  echo "用法: bash $0 <目标目录> <模块...>" >&2
  echo "可用模块: $(ls "$A/modules" | sed 's/\.js$//' | tr '\n' ' ')" >&2
  exit 1
fi

DEST="$1"; shift
if [ -e "$DEST/index.html" ]; then
  echo "错误: $DEST/index.html 已存在，不覆盖。换一个目录或先手动处理。" >&2
  exit 1
fi

for m in "$@"; do
  [ -f "$A/modules/$m.js" ] || { echo "错误: 没有模块 '$m'" >&2; exit 1; }
done

mkdir -p "$DEST"/{css,js/vendor,js/modules,fonts,images}
cp "$A/starter/css/aw-base.css" "$A/starter/css/mixed-type.css" "$DEST/css/"
cp "$A/starter/js/aw-core.js" "$DEST/js/"
cp "$A/vendor/"*.js "$A/vendor/LICENSES.md" "$DEST/js/vendor/"
cp "$A/fonts/"* "$DEST/fonts/"
for m in "$@"; do cp "$A/modules/$m.js" "$DEST/js/modules/"; done

{
  cat <<'HTML'
<!DOCTYPE html>
<html lang="zh-CN">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TITLE</title>
<meta name="description" content="DESCRIPTION">
<link rel="stylesheet" href="fonts/fonts.css">
<link rel="stylesheet" href="css/aw-base.css">
<link rel="stylesheet" href="css/mixed-type.css">
<style>
  /* 主题变量与页面私有样式写这里 */
</style>
</head>
<body>

<!-- CONTENT -->

<script src="js/vendor/gsap.min.js"></script>
<script src="js/vendor/ScrollTrigger.min.js"></script>
<script src="js/vendor/SplitText.min.js"></script>
<script src="js/vendor/lenis.min.js"></script>
<script src="js/aw-core.js"></script>
HTML
  for m in "$@"; do echo "<script src=\"js/modules/$m.js\"></script>"; done
  echo "</body>"
  echo "</html>"
} > "$DEST/index.html"

echo "已生成 $DEST （模块: $*）"
