#!/usr/bin/env python3
"""Generate abstract placeholder 'photos' for the editorial example (no third-party images).
python3 make-plates.py <out-dir>
"""
import sys
from pathlib import Path
import numpy as np
from PIL import Image, ImageFilter

out = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
out.mkdir(parents=True, exist_ok=True)
rng = np.random.default_rng(7)


def grid(w, h):
    y, x = np.mgrid[0:h, 0:w].astype(np.float32)
    return x / w, y / h


def grain(img, amount=10):
    a = np.asarray(img).astype(np.float32)
    a += rng.normal(0, amount, a.shape[:2])[..., None]
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))


def lerp(c1, c2, t):
    c1, c2 = np.array(c1, np.float32), np.array(c2, np.float32)
    return c1 + (c2 - c1) * t[..., None]


def save(img, name):
    img.save(out / name, quality=82, optimize=True, progressive=True)
    print(name, (out / name).stat().st_size // 1024, "KB")


# 1. cup from above on linen — 4:5
w, h = 1200, 1500
x, y = grid(w, h)
img = lerp((214, 204, 188), (188, 176, 158), y * 0.7 + x * 0.3)
img += (np.sin(x * w / 3.1) * 3 + np.sin(y * h / 2.7) * 3)[..., None]          # linen weave
cx, cy, r = 0.52, 0.47, 0.30
d = np.sqrt(((x - cx) * w / h) ** 2 + (y - cy) ** 2)
shadow = np.clip(1 - np.sqrt(((x - cx - 0.04) * w / h) ** 2 + (y - cy - 0.05) ** 2) / (r * 1.25), 0, 1) ** 1.6
img *= (1 - shadow * 0.35)[..., None]
cup = d < r
img[cup] = lerp((246, 242, 234), (226, 220, 210), np.clip(d / r, 0, 1))[cup]
inner = d < r * 0.78
img[inner] = lerp((92, 52, 30), (58, 32, 18), np.clip(d / (r * 0.78), 0, 1))[inner]
ang = np.arctan2(y - cy, (x - cx) * w / h)
crema = inner & (np.sin(ang * 3 + d * 60) * 0.5 + 0.5 > 0.72) & (d < r * 0.6)
img[crema] = img[crema] * 0.55 + np.array([196, 150, 104]) * 0.45
p = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.2))
save(grain(p, 7), "plate-cup.jpg")

# 2. window light on a wall — 16:9
w, h = 1920, 1080
x, y = grid(w, h)
img = lerp((176, 160, 140), (120, 104, 88), y)
beam = np.clip(1 - np.abs((x * 1.0 - y * 0.55) - 0.32) / 0.13, 0, 1)
bars = (np.sin((x * 1.0 - y * 0.55) * 90) > -0.6).astype(np.float32)
light = beam * bars
img = img * (1 - light * 0.0)[..., None] + light[..., None] * np.array([70, 58, 40])
p = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(10))
save(grain(p, 8), "plate-light.jpg")

# 3. beans scattered — 4:5
w, h = 1200, 1500
x, y = grid(w, h)
img = lerp((46, 30, 22), (28, 18, 14), y)
canvas = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
beans = np.zeros((h, w), np.float32)
yy, xx = np.mgrid[0:h, 0:w]
for _ in range(70):
    bx, by = rng.uniform(0, w), rng.uniform(0, h)
    a = rng.uniform(0, np.pi)
    rx, ry = rng.uniform(34, 46), rng.uniform(24, 32)
    dx, dy = xx - bx, yy - by
    u = (dx * np.cos(a) + dy * np.sin(a)) / rx
    v = (-dx * np.sin(a) + dy * np.cos(a)) / ry
    m = u * u + v * v
    shade = np.clip(1 - m, 0, 1) ** 0.5
    seam = np.exp(-(v * 9) ** 2) * (m < 1)
    beans = np.maximum(beans, shade * (1 - seam * 0.7))
col = np.array([138, 86, 52], np.float32)
arr = np.asarray(canvas).astype(np.float32)
arr = arr * (1 - (beans > 0)[..., None] * 0.0) + beans[..., None] * (col - arr) * (beans > 0)[..., None]
p = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
save(grain(p, 6), "plate-beans.jpg")

# 4. pour — soft vertical stream, 4:5
w, h = 1200, 1500
x, y = grid(w, h)
img = lerp((232, 226, 216), (206, 198, 186), x)
stream = np.exp(-((x - 0.5 - np.sin(y * 9) * 0.006) / (0.018 + y * 0.01)) ** 2) * (y < 0.72)
pool = np.exp(-(((x - 0.5) / 0.32) ** 2 + ((y - 0.8) / 0.06) ** 2))
dark = np.clip(stream + pool, 0, 1)
img = img * (1 - dark[..., None]) + dark[..., None] * np.array([70, 40, 24])
p = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(2.5))
save(grain(p, 7), "plate-pour.jpg")
