"""
Статичные TTF для PDF «текст в кривых» (src/features/constructor/pdf/printVectorPdf.ts).

Шрифты конструктора лежат в woff2, многие — переменные (жирность — ось wght одного файла).
Контуры букв из таких файлов в браузере достать надёжно нельзя, поэтому заранее делаем по TTF на каждое
начертание из config/font-files.ts: public/fonts/constructor/outline/<файл>-<жирность>.ttf.
Запускать после изменения списка шрифтов:  pip install fonttools brotli && python3 scripts/fonts-outline.py
"""
import re
from pathlib import Path

from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public/fonts/constructor"
OUT = SRC / "outline"
OUT.mkdir(exist_ok=True)

entries = re.findall(r"weight: '(\d+)', file: '([^']+)\.woff2'", (ROOT / "src/features/constructor/config/font-files.ts").read_text())
for weight, stem in sorted(set(entries)):
    font = TTFont(SRC / f"{stem}.woff2")
    font.flavor = None
    if "fvar" in font:
        axis = next(a for a in font["fvar"].axes if a.axisTag == "wght")
        font = instantiateVariableFont(font, {"wght": min(max(int(weight), axis.minValue), axis.maxValue)})
    font.save(OUT / f"{stem}-{weight}.ttf")
print(len(set(entries)), "files ->", OUT)
