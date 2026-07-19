#!/usr/bin/env python3
"""Generate tasteful, self-contained SVG product images with a crochet-swatch look.
No external assets or network needed, so the storefront always renders."""
import math
import os
import pathlib

OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "products"
OUT.mkdir(parents=True, exist_ok=True)

# (filename, label, base bg color, accent yarn color, second accent)
ITEMS = [
    ("granny-blanket-1", "Granny Square Blanket", "#F4EADB", "#B5654D", "#7A9377"),
    ("granny-blanket-2", "Granny Square — Detail", "#EFE6D6", "#6E4555", "#CF8368"),
    ("bunny-1", "Amigurumi Bunny", "#F7E9E4", "#CF8368", "#9CB19A"),
    ("beanie-1", "Chunky Knit Beanie", "#F2ECDC", "#C79A3B", "#7A9377"),
    ("tote-1", "Boho Crochet Tote", "#EFE3D2", "#9C5240", "#5F7A5D"),
    ("booties-1", "Baby Booties Set", "#EEF0E7", "#9CB19A", "#CF8368"),
    ("wallhanging-1", "Boho Wall Hanging", "#F1E7D8", "#8A6D4B", "#B5654D"),
    ("coasters-1", "Floral Coasters", "#F5ECE0", "#6E4555", "#7A9377"),
    ("marketbag-1", "Cotton Market Bag", "#F3EEE2", "#B5654D", "#C79A3B"),
]

W = H = 800


def stitch_pattern(accent, accent2):
    """A grid of little 'V' crochet stitches."""
    out = []
    step = 46
    for row, y in enumerate(range(120, H - 60, step)):
        color = accent if row % 2 == 0 else accent2
        for x in range(60, W - 30, step):
            out.append(
                f'<path d="M{x} {y} l11 16 l11 -16" fill="none" '
                f'stroke="{color}" stroke-width="5" stroke-linecap="round" '
                f'stroke-linejoin="round" opacity="0.30"/>'
            )
    return "\n".join(out)


def yarn_ball(cx, cy, r, accent, accent2):
    strands = []
    for i in range(-4, 5):
        off = i * (r / 5)
        strands.append(
            f'<path d="M{cx - r} {cy + off*0.4} '
            f'Q{cx} {cy + off*1.6} {cx + r} {cy + off*0.4}" '
            f'fill="none" stroke="{accent2}" stroke-width="3.5" opacity="0.55"/>'
        )
    for i in range(-4, 5):
        off = i * (r / 5)
        strands.append(
            f'<path d="M{cx + off*0.4} {cy - r} '
            f'Q{cx + off*1.6} {cy} {cx + off*0.4} {cy + r}" '
            f'fill="none" stroke="{accent2}" stroke-width="3.5" opacity="0.55"/>'
        )
    return (
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{accent}"/>'
        f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="url(#sheen)"/>'
        + "".join(strands)
        # little dangling yarn tail + hook
        + f'<path d="M{cx + r*0.7} {cy + r*0.7} q40 30 10 80 q-20 34 24 52" '
        f'fill="none" stroke="{accent}" stroke-width="5" stroke-linecap="round"/>'
    )


def svg(item):
    fname, label, bg, accent, accent2 = item
    darker = accent
    return f'''<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{bg}"/>
      <stop offset="1" stop-color="#FDFBF7"/>
    </linearGradient>
    <radialGradient id="sheen" cx="0.35" cy="0.3" r="0.8">
      <stop offset="0" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#ffffff" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="{W}" height="{H}" fill="url(#bg)"/>
  {stitch_pattern(accent, accent2)}
  <circle cx="{W/2}" cy="{H/2 - 40}" r="200" fill="#FFFFFF" opacity="0.55"/>
  {yarn_ball(W/2, H/2 - 40, 150, accent, accent2)}
  <text x="{W/2}" y="{H - 96}" text-anchor="middle"
        font-family="Playfair Display, Georgia, serif" font-size="46"
        fill="{darker}" font-weight="600">{label}</text>
  <text x="{W/2}" y="{H - 54}" text-anchor="middle"
        font-family="Inter, sans-serif" font-size="22" letter-spacing="3"
        fill="#463F3A" opacity="0.7">KNITTING STORIES</text>
</svg>
'''


for item in ITEMS:
    (OUT / f"{item[0]}.svg").write_text(svg(item))

# favicon: a small yarn ball
fav = f'''<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">
  <rect width="64" height="64" rx="14" fill="#B5654D"/>
  <circle cx="32" cy="30" r="20" fill="#F4EADB"/>
  <path d="M12 30 Q32 44 52 30" stroke="#B5654D" stroke-width="2.5" fill="none"/>
  <path d="M32 10 Q46 30 32 50" stroke="#B5654D" stroke-width="2.5" fill="none"/>
  <path d="M32 10 Q18 30 32 50" stroke="#B5654D" stroke-width="2.5" fill="none"/>
  <path d="M46 44 q10 8 2 16" stroke="#F4EADB" stroke-width="3" fill="none" stroke-linecap="round"/>
</svg>
'''
(OUT.parent / "favicon.svg").write_text(fav)
print(f"Generated {len(ITEMS)} product images + favicon in {OUT}")
