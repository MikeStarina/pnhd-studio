import type { DesignStageHandle } from '../canvas/DesignStage';
import { sidesFor } from '../config/print-areas';
import { designBounds } from '../model/bounds';
import type { PriceBreakdown } from '../model/pricing';
import { useConstructor } from '../model/store';
import { sideHasLayers, visibleLayers } from '../model/visibility';
import type { Garment } from '../model/types';
import { newDesignId, putAssets } from '../cart/assets';
import type { CartDesign } from '../cart/types';
import { printVectorPdf } from '../pdf/printVectorPdf';

/** dataURL снимка → PNG. Пустой снимок (браузер не смог создать canvas) — ошибка, а не пустая картинка в заказе. */
async function toPng(dataUrl: string): Promise<Blob> {
  const blob = await (await fetch(dataUrl)).blob();
  if (blob.type !== 'image/png' || blob.size === 0) throw new Error('export_empty');
  return blob;
}

/**
 * Снимает макет для корзины: превью каждого цвета с каждой стороной, файл печати на сторону, исходники клиента —
 * и кладёт их в IndexedDB. Холст на это время перебирает цвета и стороны и возвращается туда, где был.
 * Снимать нужно здесь: на оформлении холста нет.
 */
export async function captureDesign(stage: DesignStageHandle, garment: Garment, price: PriceBreakdown): Promise<CartDesign> {
  const { layers, method, quantities, side, garmentId, variantId, setSide, selectVariant } = useConstructor.getState();
  const id = newDesignId();
  const sides = sidesFor(garment).filter((sd) => sideHasLayers(layers, sd));
  const files: Array<[string, Blob]> = [];
  const previews: Array<Omit<CartDesign['previews'][number], 'asset'> & { name: string }> = [];
  const prints: Array<{ side: CartDesign['sides'][number]; dpi: number; name: string; vectorName?: string }> = [];

  stage.setTurnEnabled(false);
  try {
    for (const [i, line] of price.lines.entries()) {
      selectVariant(line.productId);
      for (const sd of sides) {
        setSide(sd);
        // Снимок — только когда холст показал этот цвет и сторону и загрузил их картинки.
        await stage.whenReady();
        const preview = stage.exportPreview();
        if (!preview) throw new Error('export_failed');
        const name = `preview_${i}_${sd}.png`;
        files.push([name, await toPng(preview)]);
        previews.push({ productId: line.productId, color: line.color, hex: line.hex, side: sd, name });
        if (i === 0) {
          const print = stage.exportPrint();
          if (!print) throw new Error('export_failed');
          const printName = `print_${sd}_${print.dpi}dpi.png`;
          files.push([printName, await toPng(print.dataUrl)]);
          // DTF: дизайнеру нужен текст кривыми — под него кладут подложку. DTG печатают с PNG.
          // Это дополнение к PNG: не собрался — позиция всё равно уходит в корзину.
          const vector = method === 'dtf' && print.texts.length
            ? await printVectorPdf(print.art ? await toPng(print.art) : null, print.size, print.texts)
              .catch((e) => { console.error('[constructor] vector pdf', e); return null; })
            : null;
          const vectorName = vector ? `print_${sd}_vector.pdf` : undefined;
          if (vector && vectorName) files.push([vectorName, vector]);
          prints.push({ side: sd, dpi: print.dpi, name: printName, vectorName });
        }
      }
    }
  } finally {
    if (variantId) selectVariant(variantId);
    setSide(side);
    stage.setTurnEnabled(true);
  }

  // Исходники клиента — как загружены, без пересжатия; один файл — один раз, даже если слоёв несколько.
  // Сохраняем и скрытые слои: при правке из корзины они нужны. В заказ (originals) идут только напечатанные.
  // Картинки по http (готовые принты) остаются ссылками.
  const modelSides = sidesFor(garment);
  const kept = layers.filter((l) => modelSides.includes(l.side));
  const printed = new Set(visibleLayers(layers).filter((l) => sides.includes(l.side)).map((l) => l.id));
  const local = new Map<string, { name: string; file: string; printed: boolean }>();
  for (const l of kept) {
    const hit = l.kind === 'image' ? local.get(l.src) : undefined;
    if (hit && printed.has(l.id)) hit.printed = true;
    if (l.kind !== 'image' || !/^(data|blob):/.test(l.src) || local.has(l.src)) continue;
    const file = `original_${local.size}_${l.fileName}`;
    local.set(l.src, { name: l.fileName, file, printed: printed.has(l.id) });
    files.push([file, await (await fetch(l.src)).blob()]);
  }

  await putAssets(id, files);
  const key = (name: string) => `${id}/${name}`;
  return {
    id,
    addedAt: Date.now(),
    garment: { id: garmentId ?? garment.id, name: garment.name, type: garment.type, shapeId: garment.shapeId },
    method,
    bounds: designBounds(garment, layers),
    // Конструктор хранит количества по всем моделям, которые трогали; в позицию — только по цветам этой
    quantities: Object.fromEntries(Object.entries(quantities).filter(([productId]) => garment.variants.some((v) => v.productId === productId))),
    sides,
    layers: kept.map((l) => (l.kind === 'image' && local.has(l.src) ? { ...l, src: key(local.get(l.src)!.file) } : l)),
    previews: previews.map(({ name, ...p }) => ({ ...p, asset: key(name) })),
    prints: prints.map(({ name, vectorName, ...p }) => ({ ...p, asset: key(name), ...(vectorName ? { vector: key(vectorName) } : {}) })),
    originals: [...local.values()].filter((o) => o.printed).map(({ name, file }) => ({ name, asset: key(file) })),
    price: {
      qty: price.qty,
      total: price.total,
      lines: price.lines.map(({ productId, color, hex, sizes, qty, perItem, total }) => ({ productId, color, hex, sizes, qty, perItem, total })),
    },
  };
}
