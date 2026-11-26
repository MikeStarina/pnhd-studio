'use client';
import { Image as KImage, Shape } from 'react-konva';
import useImage from 'use-image';
import type Konva from 'konva';
import { measureText, textFont } from '../model/trim';
import { drawMasked } from './masked';
import type { DesignLayer } from '../model/types';

interface Props {
  layer: DesignLayer;
  /** Размер зоны печати в пикселях экрана. */
  area: { w: number; h: number };
  onSelect: () => void;
  /** Нажатие без перетаскивания (клик / тап). */
  onTap?: () => void;
  /** Слой в группе готового принта, пока выбран принт целиком, сам не перетаскивается — тащится группа. */
  draggable?: boolean;
  onChange: (patch: Partial<DesignLayer>) => void;
  /** Узел во время перетаскивания (для прилипания к центру); null — перетаскивание закончилось. */
  onDrag?: (node: Konva.Node | null) => void;
}

/** Имя узлов дизайна — по нему холст отличает их от служебных (тени, рамки). */
export const DESIGN_NODE = 'design';

/** Отражение внутри прямоугольника w×h: по горизонтали и/или по вертикали. */
function mirror(c: CanvasRenderingContext2D, w: number, h: number, fx?: boolean, fy?: boolean) {
  if (fx) { c.translate(w, 0); c.scale(-1, 1); }
  if (fy) { c.translate(0, h); c.scale(1, -1); }
}

/** Рисует Konva.Image зеркально (с учётом обрезки пустых полей). */
function flippedImage(ctx: Konva.Context, shape: Konva.Shape) {
  const img = (shape as Konva.Image).image() as CanvasImageSource | undefined;
  if (!img) return;
  const c = ctx._context;
  const crop = shape.getAttr('crop') as { x: number; y: number; width: number; height: number } | undefined;
  c.save();
  mirror(c, shape.width(), shape.height(), shape.getAttr('flipX'), shape.getAttr('flipY'));
  if (crop) c.drawImage(img, crop.x, crop.y, crop.width, crop.height, 0, 0, shape.width(), shape.height());
  else c.drawImage(img, 0, 0, shape.width(), shape.height());
  c.restore();
}

/** Слой дизайна. Координаты хранятся в долях зоны печати, на экране — пиксели. */
export function LayerNode({ layer, area, onSelect, onTap, draggable = true, onChange, onDrag }: Props) {
  const [img] = useImage(layer.kind === 'image' ? layer.src : '', 'anonymous');

  const common = {
    id: layer.id,
    name: DESIGN_NODE,
    x: layer.x * area.w,
    y: layer.y * area.h,
    rotation: layer.rotation,
    draggable,
    onMouseDown: onSelect,
    onTouchStart: onSelect,
    onClick: onTap,
    onTap,
    onDragMove: (e: Konva.KonvaEventObject<DragEvent>) => onDrag?.(e.target),
    onDragEnd: (e: Konva.KonvaEventObject<DragEvent>) => {
      onDrag?.(null);
      onChange({ x: e.target.x() / area.w, y: e.target.y() / area.h });
    },
    onTransformEnd: (e: Konva.KonvaEventObject<Event>) => {
      const n = e.target;
      const sx = n.scaleX();
      n.scaleX(1);
      n.scaleY(1);
      const base = { x: n.x() / area.w, y: n.y() / area.h, rotation: n.rotation() };
      if (layer.kind === 'image') onChange({ ...base, width: (n.width() * sx) / area.w });
      else onChange({ ...base, fontSize: layer.fontSize * sx });
    },
  };

  if (layer.kind === 'image') {
    const mask = layer.mask;
    return (
      <KImage
        {...common}
        sceneFunc={mask ? (ctx, shape) => {
          const image = (shape as Konva.Image).image() as HTMLImageElement | undefined;
          if (!image) return;
          const c = ctx._context;
          const src = layer.crop ?? { x: 0, y: 0, width: image.naturalWidth, height: image.naturalHeight };
          c.save();
          mirror(c, shape.width(), shape.height(), layer.flipX, layer.flipY);
          drawMasked(c, image, src, shape.width(), shape.height(), mask);
          c.restore();
        } : layer.flipX || layer.flipY ? flippedImage : undefined}
        flipX={layer.flipX}
        flipY={layer.flipY}
        image={img}
        crop={layer.crop}
        width={layer.width * area.w}
        height={(layer.width * area.w * layer.naturalHeight) / layer.naturalWidth}
      />
    );
  }

  // Текст рисуем сами: у Konva.Text рамка — строка шрифта с запасом сверху и снизу,
  // а нужна рамка по буквам (и по обводке, и по дуге). Точка (x, y) — середина надписи.
  const fontPx = layer.fontSize * area.w;
  const box = measureText(layer.text, layer, fontPx);
  return (
    <Shape
      {...common}
      width={box.width}
      height={box.height}
      offsetX={box.width / 2}
      offsetY={box.height / 2}
      fill={layer.fill}
      sceneFunc={(ctx, shape) => {
        const c = ctx._context;
        c.font = textFont(layer, fontPx);
        c.textAlign = box.centered ? 'center' : 'left';
        c.textBaseline = 'alphabetic';
        c.lineJoin = 'round';
        mirror(c, box.width, box.height, layer.flipX, layer.flipY);
        const put = (paint: (it: (typeof box.items)[number]) => void) => {
          for (const it of box.items) {
            c.save();
            c.translate(it.x, it.y);
            c.rotate(it.rot);
            paint(it);
            c.restore();
          }
        };
        // Сначала вся обводка, потом заливка: иначе обводка соседней буквы закрыла бы заливку предыдущей.
        // Линия по контуру делится пополам, поэтому толщина вдвое — наружу выходит нужная.
        if (box.stroke > 0) {
          c.strokeStyle = layer.strokeColor;
          c.lineWidth = box.stroke * 2;
          put((it) => c.strokeText(it.text, 0, 0));
        }
        c.fillStyle = shape.fill() as string;
        put((it) => c.fillText(it.text, 0, 0));
      }}
      hitFunc={(ctx, shape) => {
        ctx.beginPath();
        ctx.rect(0, 0, box.width, box.height);
        ctx.closePath();
        ctx.fillStrokeShape(shape);
      }}
    />
  );
}
