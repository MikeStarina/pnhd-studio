'use client';
import { useEffect, useRef, useState } from 'react';
import { track } from '../analytics/events';
import type { Garment, GarmentType, GarmentVariant } from '../model/types';
import { SHAPES } from '../config/garment-shapes';
import { promoPrice } from '../config/promo';
import { Icon } from './icons';
import s from './constructor.module.css';
import c from './garment.module.css';

const TYPE_LABEL: Record<GarmentType, string> = {
  tshirt: 'Футболки', longsleeve: 'Лонгсливы', sweatshirt: 'Свитшоты', hoodie: 'Худи', totebag: 'Шопперы', cap: 'Кепки',
};

export const GarmentIcon = ({ type, size = 28 }: { type: GarmentType; size?: number }) => <Icon name={type} size={size} />;

/** «Футболка OVERSIZE» → «OVERSIZE»: тип уже выбран выше, повторять его в каждой строке незачем. */
const modelLabel = (g: Garment) => g.name.split(/\s+/).slice(1).join(' ') || g.name;
/** «10-12 лет 128-134 см» → «10-12 лет»: детские размеры в чипе — только возраст, рост — в подсказке. */
const sizeLabel = (size: string) => size.match(/^\S+ (?:лет|года?)/)?.[0] ?? size;
/** Миниатюра типа: мокап первой модели; без мокапа (кепка) — линейная иконка. */
/** Цена в выборе изделия: на время акции — со скидкой, рядом зачёркнутая цена без неё */
function PriceTag({ type, price, from }: { type: GarmentType; price: number; from: boolean }) {
  const now = promoPrice(price, type);
  return (
    <span className={c.price}>
      {from && 'от '}
      {now < price && <s className={c.old}>{rub(price)}</s>}
      {rub(now)}
    </span>
  );
}

function TypeThumb({ garment }: { garment: Garment }) {
  const src = garment.shapeId ? SHAPES[garment.shapeId].images.front : null;
  return (
    <span className={c.thumb}>
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={src} alt="" loading="lazy" draggable={false} />
      ) : (
        <GarmentIcon type={garment.type} />
      )}
    </span>
  );
}

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

/**
 * Левая колонка: список типов изделий, модели выбранного типа и карточка модели —
 * описание из каталога и размеры выбранного цвета. Таблица обмеров — в секции размеров справа.
 */
export function GarmentPicker({ garments, garmentId, variant, onSelect, linked }: {
  garments: Garment[];
  garmentId: string | null;
  variant: GarmentVariant | null;
  onSelect: (id: string) => void;
  /** Изделие выбрано по ссылке со страницы товара: список типов сворачивается, как после ручного выбора. */
  linked?: boolean;
}) {
  const [more, setMore] = useState(false);
  // Пока покупатель не выбрал тип руками, список типов раскрыт; после выбора он сворачивается в строку «Изменить».
  const [typePicked, setTypePicked] = useState(false);
  const [typesOpen, setTypesOpen] = useState(true);
  useEffect(() => {
    if (!linked) return;
    setTypePicked(true);
    setTypesOpen(false);
  }, [linked]);
  const changeBtn = useRef<HTMLButtonElement>(null);
  const current = garments.find((g) => g.id === garmentId);
  const types = [...new Set(garments.map((g) => g.type))];
  const models = garments.filter((g) => g.type === current?.type);
  const pick = (id: string) => { onSelect(id); setMore(false); track('garment_select', { id }); };
  const pickType = (id: string) => {
    pick(id);
    setTypePicked(true);
    setTypesOpen(false);
    // Нажатая кнопка типа исчезает вместе с фокусом: возвращаем его на «Изменить».
    requestAnimationFrame(() => changeBtn.current?.focus());
  };

  const about = variant?.description ?? '';
  const sizes = variant?.sizes ?? [];
  const oneSize = sizes.length === 1 && /one size/i.test(sizes[0]);

  if (!garments.length) return null;

  return (
    <>
      {typePicked && current && (
        <div className={c.typeSummary}>
          <TypeThumb garment={garments.find((g) => g.type === current.type) ?? current} />
          <span className={c.typeName}>{TYPE_LABEL[current.type]}</span>
          <button
            ref={changeBtn} className={c.linkBtn} aria-expanded={typesOpen} aria-controls="garment-types"
            aria-label="Изменить тип изделия" onClick={() => setTypesOpen((o) => !o)}
          >
            Изменить
          </button>
        </div>
      )}
      {(typesOpen || !typePicked) && (
        <div id="garment-types" className={c.types} role="radiogroup" aria-label="Тип изделия">
          {types.map((t) => {
            const ofType = garments.filter((g) => g.type === t);
            const active = t === current?.type;
            return (
              <button
                key={t} role="radio" aria-checked={active} className={active ? c.typeActive : c.type}
                onClick={() => (active ? setTypesOpen(false) : pickType(ofType[0].id))}
              >
                <TypeThumb garment={ofType[0]} />
                <span className={c.typeText}>
                  <span className={c.typeName}>{TYPE_LABEL[t]}</span>
                  <PriceTag type={t} price={Math.min(...ofType.map((g) => g.basePrice))} from />
                </span>
              </button>
            );
          })}
        </div>
      )}

      {models.length > 0 && (
        <>
          <h3 className={s.h}>Модель</h3>
          <div className={c.models} role="radiogroup" aria-label="Модель">
            {models.map((g) => {
              const active = g.id === garmentId;
              const prices = g.variants.map((v) => v.price);
              const range = Math.max(...prices) > g.basePrice;
              return (
                <button
                  key={g.id} role="radio" aria-checked={active} className={active ? c.modelActive : c.model}
                  title={g.name} onClick={() => !active && pick(g.id)}
                >
                  <span className={c.modelName}>{modelLabel(g)}</span>
                  <PriceTag type={g.type} price={g.basePrice} from={range} />
                </button>
              );
            })}
          </div>
        </>
      )}

      {current && variant && (
        <div className={c.about} key={current.id}>
          {about && (
            <>
              <p className={more ? c.aboutTextOpen : c.aboutText}>{about}</p>
              {about.length > 110 && (
                <button className={c.linkBtn} onClick={() => setMore((m) => !m)}>{more ? 'Свернуть' : 'Читать полностью'}</button>
              )}
            </>
          )}
          {sizes.length > 0 && (
            <div className={c.aboutSizes}>
              <span className={c.aboutLabel}>{oneSize ? 'Размер' : 'Размеры в наличии'}</span>
              <div className={c.sizeChips}>
                {sizes.map((z) => <span key={z} className={c.sizeChip} title={z}>{sizeLabel(z)}</span>)}
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
