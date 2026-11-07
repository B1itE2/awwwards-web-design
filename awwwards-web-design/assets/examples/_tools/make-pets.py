#!/usr/bin/env python3
"""Prepare the pets example images from white-background product photos.
python3 make-pets.py <photo-dir> <out-dir>
Expects white-sweater-cat.png, white-cardigan.png, white-raincoat.png (1024x1536).
  look-*.jpg     same crop box for every photo, so pets stand on the same floor line
  swatch-*.jpg   square fabric close-ups for the accessory column
  detail-*.jpg   4:5 close-up for the image-reveal section
"""
import sys
from pathlib import Path
from PIL import Image

src, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)

LOOK_BOX = (12, 380, 1024, 1340)


def whiten(im, floor=238):
    """Push the near-white studio background to pure white so mix-blend-mode: multiply leaves no box."""
    lo = floor - 30  # below lo untouched; lo..floor ramps smoothly up to 255
    lut = [v if v <= lo else 255 if v >= floor else round(lo + (v - lo) * (255 - lo) / (floor - lo)) for v in range(256)]
    return im.point(lut * 3)


PETS = {
    "cat": ("white-sweater-cat.png", [("turtleneck", (390, 690, 650, 950)), ("rib-knit", (390, 880, 650, 1140)), ("cuff", (560, 960, 800, 1200))]),
    "samoyed": ("white-cardigan.png", [("shawl-collar", (470, 770, 730, 1030)), ("cable-knit", (630, 870, 890, 1130)), ("buttons", (150, 980, 410, 1240))]),
    "corgi": ("white-raincoat.png", [("buckle", (200, 750, 460, 1010)), ("harness", (510, 690, 770, 950)), ("waxed-cotton", (300, 890, 560, 1150))]),
}
DETAIL = ("samoyed", (560, 760, 1000, 1310))

photos = {}
for key, (fname, swatches) in PETS.items():
    im = whiten(Image.open(src / fname).convert("RGB"))
    photos[key] = im
    look = im.crop(LOOK_BOX)
    look.thumbnail((900, 900), Image.LANCZOS)
    look.save(out / f"look-{key}.jpg", quality=86, optimize=True)
    for name, box in swatches:
        im.crop(box).resize((320, 320), Image.LANCZOS).save(out / f"swatch-{name}.jpg", quality=84, optimize=True)

key, box = DETAIL
photos[key].crop(box).resize((880, 1100), Image.LANCZOS).save(out / "detail-cable.jpg", quality=86, optimize=True)
print("ok", out)
