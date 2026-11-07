#!/usr/bin/env python3
"""Generate placeholder art for the showcase example (no third-party images).
python3 make-showcase.py <out-dir>
  disc-*.jpg   square poster-style disc faces (abstract shapes + big type)
  look-*.png   lathe-rendered ceramic vessels on transparent background
  item-*.png   small companion pieces (cup, plate, lid, spoon)
"""
import sys
import warnings
warnings.filterwarnings("ignore")
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

out = Path(sys.argv[1] if len(sys.argv) > 1 else ".")
out.mkdir(parents=True, exist_ok=True)
FONTS = Path(__file__).resolve().parents[2] / "fonts"
rng = np.random.default_rng(11)


def font(size, serif=False):
    for p in (["/System/Library/Fonts/Supplemental/Didot.ttc", "/System/Library/Fonts/Supplemental/Georgia.ttf"] if serif
              else ["/System/Library/Fonts/Supplemental/Impact.ttf", "/System/Library/Fonts/Helvetica.ttc"]):
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


def grain(img, amount=12):
    a = np.asarray(img).astype(np.int16)
    n = rng.normal(0, amount, a.shape[:2])[..., None]
    a[..., :3] = np.clip(a[..., :3] + n, 0, 255)
    return Image.fromarray(a.astype(np.uint8))


# ---------- disc faces ----------
DISCS = [
    ("SALT HOUR", (196, 72, 44), (240, 214, 170), "sun"),
    ("NORTHBOUND", (28, 40, 78), (210, 228, 90), "stripes"),
    ("PALE ECHO", (210, 206, 196), (40, 40, 40), "rings"),
    ("LOW TIDE", (92, 110, 60), (240, 236, 220), "waves"),
    ("RED ROOM", (24, 22, 22), (226, 52, 60), "grid"),
    ("SOFT ALARM", (236, 170, 196), (60, 20, 60), "blob"),
]


def disc(title, bg, fg, motif, S=1000):
    im = Image.new("RGB", (S, S), bg)
    d = ImageDraw.Draw(im)
    if motif == "sun":
        for r in range(520, 0, -60):
            t = r / 520
            c = tuple(int(bg[k] * t + fg[k] * (1 - t)) for k in range(3))
            d.ellipse([S / 2 - r, S * 0.62 - r, S / 2 + r, S * 0.62 + r], fill=c)
    elif motif == "stripes":
        for i in range(-S, S * 2, 90):
            d.polygon([(i, 0), (i + 45, 0), (i + 45 - S * 0.6, S), (i - S * 0.6, S)], fill=tuple(int(v * 0.8) for v in bg))
    elif motif == "rings":
        for r in range(30, 700, 26):
            d.ellipse([S * 0.3 - r, S * 0.35 - r, S * 0.3 + r, S * 0.35 + r], outline=tuple(int(v * 0.85) for v in bg), width=3)
    elif motif == "waves":
        for j in range(14):
            y0 = S * 0.45 + j * 38
            pts = [(x, y0 + 18 * np.sin(x / 70 + j)) for x in range(0, S + 10, 10)]
            d.line(pts, fill=fg if j % 3 == 0 else tuple(int(v * 1.25) for v in bg), width=6)
    elif motif == "grid":
        for i in range(0, S, 125):
            for j in range(0, S, 125):
                if (i + j) // 125 % 3 == 0:
                    d.rectangle([i + 10, j + 10, i + 115, j + 115], fill=(60, 20, 22))
    elif motif == "blob":
        b = Image.new("L", (S, S), 0)
        bd = ImageDraw.Draw(b)
        for _ in range(9):
            x, y, r = rng.uniform(250, 750), rng.uniform(250, 750), rng.uniform(80, 200)
            bd.ellipse([x - r, y - r, x + r, y + r], fill=255)
        b = b.filter(ImageFilter.GaussianBlur(40)).point(lambda v: 255 if v > 120 else 0)
        im.paste(Image.new("RGB", (S, S), (250, 220, 230)), (0, 0), b)
    # title, stacked words, set big
    words = title.split()
    f = font(210)
    widest = max(d.textlength(w, font=f) for w in words)
    if widest > S * 0.82:
        f = font(int(210 * S * 0.82 / widest))
    y = S * 0.16 if motif in ("sun", "waves") else S * 0.56
    for w in words:
        tw = d.textlength(w, font=f)
        d.text(((S - tw) / 2, y), w, font=f, fill=fg)
        y += 200
    fs = font(34, serif=True)
    d.text((S * 0.5 - d.textlength("A FILM BY NOBODY", font=fs) / 2, S * 0.9), "A FILM BY NOBODY", font=fs, fill=fg)
    grain(im, 9).save(out / f"disc-{title.lower().replace(' ', '-')}.jpg", quality=84)


for args in DISCS:
    disc(*args)


# ---------- lathe-rendered ceramics ----------
def lathe(profile, W, H, glaze, rim=None, speck=0.0, light=(-0.55, -0.35, 0.76)):
    """profile(t) -> radius in [0,1] for t in [0,1] top..bottom; returns RGBA."""
    img = np.zeros((H, W, 4), np.float32)
    L = np.array(light) / np.linalg.norm(light)
    ys = np.arange(H)
    t = ys / (H - 1)
    r = np.array([profile(v) for v in t]) * (W / 2 - 4)
    dr = np.gradient(r)
    cx = W / 2
    xs = np.arange(W)
    for y in range(H):
        if r[y] < 1:
            continue
        u = (xs - cx) / r[y]
        m = np.abs(u) <= 1
        nx = u
        nz = np.sqrt(np.clip(1 - u * u, 0, 1))
        ny = -dr[y] * np.ones_like(u) * 0.9
        n = np.stack([nx, ny, nz], -1)
        n /= np.linalg.norm(n, axis=-1, keepdims=True) + 1e-6
        diff = np.clip(n @ L, 0, 1)
        h = n + np.array([0, 0, 1]) + L
        h /= np.linalg.norm(h, axis=-1, keepdims=True)
        spec = np.clip(n @ (L + np.array([0, 0, 1])) / np.linalg.norm(L + np.array([0, 0, 1])), 0, 1) ** 40
        col = np.array(glaze, np.float32)
        if rim and t[y] < rim[1]:
            col = np.array(rim[0], np.float32)
        shade = 0.28 + 0.8 * diff
        c = col[None] * shade[:, None] + 255 * 0.55 * spec[:, None]
        # edge softening
        a = np.clip((1 - np.abs(u)) * r[y] * 0.9, 0, 1) * 255
        img[y, m, :3] = c[m]
        img[y, m, 3] = a[m]
    if speck:
        k = rng.random((H, W)) < speck
        img[k, :3] *= 0.45
    im = Image.fromarray(np.clip(img, 0, 255).astype(np.uint8))
    # soft contact shadow
    canvas = Image.new("RGBA", (W, H + 40), (0, 0, 0, 0))
    sh = Image.new("L", (W, H + 40), 0)
    ImageDraw.Draw(sh).ellipse([W * 0.12, H + 4, W * 0.88, H + 30], fill=70)
    sh = sh.filter(ImageFilter.GaussianBlur(10))
    canvas.paste(Image.new("RGBA", canvas.size, (30, 26, 22, 255)), (0, 0), sh)
    canvas.alpha_composite(im, (0, 0))
    return canvas


def vase(neck, belly, foot, bulge=0.62):
    """Smooth vase: lip, neck, then a sine belly peaking at `bulge` (0..1 down the body), tapering to the foot."""
    def p(t):
        if t < 0.03:
            return neck * 1.18
        if t < 0.18:
            return neck
        s = (t - 0.18) / 0.82
        k = s / bulge if s < bulge else 1 + (s - bulge) / (1 - bulge)
        w = np.sin(np.pi * k / 2) if k <= 1 else np.cos(np.pi * (k - 1) / 2)
        base = neck + (foot - neck) * s
        return max(foot * 0.95, base + (belly - base) * w ** 0.8)
    return p


LOOKS = [
    ("look-1", vase(0.28, 0.98, 0.42), 560, 900, (36, 52, 92), ((220, 200, 150), 0.05), 0.0),
    ("look-2", vase(0.5, 0.92, 0.55, 0.45), 600, 760, (176, 82, 52), None, 0.004),
    ("look-3", vase(0.2, 0.7, 0.36, 0.7), 420, 960, (226, 222, 210), ((90, 90, 86), 0.04), 0.006),
    ("look-4", vase(0.62, 1.0, 0.5, 0.3), 640, 640, (82, 106, 70), None, 0.0),
    ("look-5", vase(0.34, 0.86, 0.48, 0.55), 560, 820, (190, 150, 60), ((60, 40, 20), 0.05), 0.003),
]
for name, prof, w, h, glaze, rim, sp in LOOKS:
    lathe(prof, w, h, glaze, rim, sp).save(out / f"{name}.png", optimize=True)

ITEMS = [
    ("cup", lambda t: 0.82 + 0.14 * t if t > 0.03 else 0.98, 300, 260),
    ("bowl", lambda t: 1.0 * np.cos(t * 1.25) ** 0.6 if t < 0.95 else 0.42, 340, 180),
    ("bottle", lambda t: 0.22 if t < 0.35 else min(0.9, 0.22 + (t - 0.35) * 4), 200, 320),
    ("jar", lambda t: 0.6 if t < 0.12 else 0.9, 280, 300),
]
GLAZES = [(36, 52, 92), (176, 82, 52), (226, 222, 210), (82, 106, 70), (190, 150, 60)]
for gi, g in enumerate(GLAZES):
    for k, (iname, prof, w, h) in enumerate(ITEMS):
        if (k + gi) % 4 == 3:
            continue
        lathe(prof, w, h, g, None, 0.003 if gi in (1, 2) else 0).save(out / f"item-{gi + 1}-{iname}.png", optimize=True)
print("ok", out)
