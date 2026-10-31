#!/usr/bin/env python3
"""Gera os ícones do app a partir de assets/logo-original.png (logo sobre fundo preto).

Uso:  pip install pillow   (só para este script; o app em si não tem dependências)
      python3 scripts/make-icons.py [caminho-do-logo]

Saída em src/icons/: icon-192, icon-512, icon-maskable-512, apple-touch-icon (180) e logo-mark.png
(emblema com fundo transparente para o cabeçalho).
"""
import sys
from pathlib import Path
from PIL import Image
import numpy as np

ROOT = Path(__file__).resolve().parent.parent
SRC = Path(sys.argv[1]) if len(sys.argv) > 1 else ROOT / "assets" / "logo-original.png"
OUT = ROOT / "src" / "icons"
BLACK = (0, 0, 0)
THRESHOLD = 40          # brilho mínimo para considerar "tem logo"
MARK_HEIGHT = 128       # altura do emblema (exibido a ~32 px; 4x para telas retina)

logo = Image.open(SRC).convert("RGB")
side = max(logo.size)
square = Image.new("RGB", (side, side), BLACK)
square.paste(logo, ((side - logo.width) // 2, (side - logo.height) // 2))
OUT.mkdir(parents=True, exist_ok=True)


def save_square(size, name):
    square.resize((size, size), Image.LANCZOS).save(OUT / name, optimize=True)


save_square(192, "icon-192.png")
save_square(512, "icon-512.png")
save_square(180, "apple-touch-icon.png")

# Ícone "maskable": logo menor, dentro da zona segura (o sistema pode cortar as bordas em círculo).
canvas = Image.new("RGB", (512, 512), BLACK)
inner = square.resize((int(512 * 0.78),) * 2, Image.LANCZOS)
canvas.paste(inner, ((512 - inner.width) // 2, (512 - inner.height) // 2))
canvas.save(OUT / "icon-maskable-512.png", optimize=True)

# Emblema (parte de cima, antes do texto) com fundo transparente: alfa = brilho do pixel.
bright = np.array(square).max(axis=2) > THRESHOLD
row_has = bright.sum(axis=1) > 3
ys = np.where(row_has)[0]
top = ys[0]
bottom = top
for y in ys[1:]:                      # para no primeiro vão vazio depois do emblema
    if y - bottom > 8:
        break
    bottom = y
cols = np.where(bright[top:bottom + 1].sum(axis=0) > 3)[0]
pad = 6
box = (max(0, cols[0] - pad), max(0, top - pad), min(side, cols[-1] + pad + 1), min(side, bottom + pad + 1))
crop = square.crop(box)
scale = MARK_HEIGHT / crop.height
crop = crop.resize((round(crop.width * scale), MARK_HEIGHT), Image.LANCZOS)
rgb = np.array(crop).astype(float)
alpha = rgb.max(axis=2)
color = np.where(alpha[..., None] > 0, rgb / np.maximum(alpha[..., None], 1) * 255, 0)
mark = np.dstack([np.clip(color, 0, 255), alpha]).astype("uint8")
Image.fromarray(mark, "RGBA").save(OUT / "logo-mark.png", optimize=True)
print("ícones gerados em", OUT)
