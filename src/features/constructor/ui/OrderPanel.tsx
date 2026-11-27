'use client';
import { useEffect, useRef, useState } from 'react';
import { track } from '../analytics/events';
import { METHOD_INFO } from '../config/pricing';
import { PROMO_TEXT } from '../config/promo';
import { STOCK_HINTS } from '../config/stock';
import { SIZE_CHART } from '../config/size-chart';
import type { calcPrice } from '../model/pricing';
import { selectGarment, selectSizes, useConstructor, variantQty } from '../model/store';
import { SIDE_LABEL, type GarmentVariant, type PrintMethod } from '../model/types';
import { Icon } from './icons';
import s from './constructor.module.css';
import o from './order.module.css';

type Price = ReturnType<typeof calcPrice>;
const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;
const sizeList = (sizes: Array<[string, number]>) => sizes.map(([k, n]) => `${k}×${n}`).join(', ');
/** 1 цвет, 2 цвета, 5 цветов. */
export const colorsWord = (n: number) => {
  const d = n % 10, h = n % 100;
  return `${n} ${d === 1 && h !== 11 ? 'цвет' : d >= 2 && d <= 4 && (h < 12 || h > 14) ? 'цвета' : 'цветов'}`;
};

/** Мягкая подпись об остатке: нужно больше, чем есть (в том числе при нуле) — остальное под заказ. null — остаток известен и хватает. */
export function stockHint(stock: number | undefined, want: number): string | null {
  if (!STOCK_HINTS || stock === undefined || want <= stock) return null;
  return stock <= 0 ? 'нет в наличии — под заказ' : `в наличии ${stock} — остальное под заказ`;
}

/** «DTG — прямая печать» → «DTG» и «прямая печать». */
const splitTitle = (t: string) => {
  const [a, ...b] = t.split(/\s+[—–-]\s+/);
  return [a, b.join(' — ')] as const;
};
/** «10-12 лет 128-134 см» → «10-12 лет» крупно и «128-134 см» мелко; обычные размеры остаются как есть. */
const splitSize = (size: string) => {
  const m = size.match(/^(\S+ (?:лет|года?))\s+(.+)$/);
  return m ? ([m[1], m[2]] as const) : ([size, ''] as const);
};

/** Нанесение, размеры с количеством и разбивка цены. */
export function OrderPanel({ variant, price, onSizeChart }: {
  variant: GarmentVariant | null;
  price: Price | null;
  onSizeChart: () => void;
}) {
  const method = useConstructor((st) => st.method);
  const sizes = useConstructor(selectSizes);
  const quantities = useConstructor((st) => st.quantities);
  const garments = useConstructor((st) => st.garments);
  const garment = useConstructor(selectGarment);
  const { setMethod, incSize, setSizeQty, copySizes, clearSizes, selectVariant, selectGarment: openGarment } = useConstructor.getState();

  const lines = price?.lines ?? [];
  const curQty = price?.current?.qty ?? 0;
  // Цвет пока пустой, а другие набраны — предлагаем взять их размеры (только те, что есть у этого цвета).
  const copyFrom = curQty ? [] : lines.filter((l) => l.productId !== variant?.productId && l.sizes.some(([k]) => variant?.sizes.includes(k)));
  // Набранное у других моделей в заявку не идёт: в одной заявке одна модель.
  const elsewhere = garments
    .filter((g) => g.id !== garment?.id)
    .map((g) => ({ g, qty: g.variants.reduce((n, v) => n + variantQty(quantities, v), 0) }))
    .filter((x) => x.qty > 0);

  return (
    <>
      <h3 className={s.h}>Нанесение</h3>
      <div className={o.seg} role="radiogroup" aria-label="Метод печати">
        {(Object.keys(METHOD_INFO) as PrintMethod[]).map((m) => {
          const [name, sub] = splitTitle(METHOD_INFO[m].title);
          return (
            <button
              key={m} type="button" role="radio" aria-checked={method === m}
              className={method === m ? o.segBtnActive : o.segBtn} onClick={() => setMethod(m)}
            >
              {name}
              {sub && <small>{sub}</small>}
            </button>
          );
        })}
      </div>
      <div className={o.card}><p>{METHOD_INFO[method].hint}</p></div>

      <div className={o.subRow}>
        <h3 className={s.h} style={{ margin: 0 }}><span className={s.hNum} aria-hidden>3</span>Размеры</h3>
        {SIZE_CHART.some((r) => variant?.sizes.includes(r.size)) && (
          <button type="button" className={o.chartLink} onClick={onSizeChart}>
            <Icon name="ruler" size={16} />Подобрать размер
          </button>
        )}
      </div>
      {variant && garment && garment.variants.length > 1 && (
        <p className={o.forColor}><i style={{ background: variant.hex }} />Для цвета «{variant.colorName}»</p>
      )}
      {copyFrom.length > 0 && (
        <div className={o.copy}>
          <span className={o.note}>Те же размеры, что у:</span>
          {copyFrom.slice(0, 3).map((l) => (
            <button key={l.productId} type="button" className={o.copyBtn} title={sizeList(l.sizes)}
              onClick={() => { copySizes(l.productId); track('sizes_copy'); }}>
              <i style={{ background: l.hex }} />{l.color}<small>{sizeList(l.sizes)}</small>
            </button>
          ))}
        </div>
      )}
      <div className={o.sizes}>
        {variant?.sizes.map((size) => {
          const q = sizes[size] ?? 0;
          const [main, sub] = splitSize(size);
          const hint = stockHint(variant.stock?.[size], q);
          return (
            <div key={size} className={q ? o.sizeActive : o.size}>
              <span className={o.sizeName}>{main}{sub && <small>{sub}</small>}{hint && <small className={o.stockHint}>{hint}</small>}</span>
              <div className={o.step}>
                <button type="button" aria-label={`Меньше ${size}`} onClick={() => incSize(size, -1)} disabled={!q}><Icon name="minus" size={16} /></button>
                <input
                  type="number" min={0} inputMode="numeric" value={q} aria-label={`Количество ${size}`}
                  onChange={(e) => { setSizeQty(size, Number(e.target.value) || 0); track('size_set'); }}
                />
                <button type="button" aria-label={`Больше ${size}`} onClick={() => { incSize(size, 1); track('size_set'); }}><Icon name="plus" size={16} /></button>
              </div>
            </div>
          );
        })}
      </div>
      {lines.length > 0 && (
        <div className={o.cart}>
          <p className={o.cartHead}>В заявке{lines.length > 1 && ` · ${colorsWord(lines.length)}`}</p>
          {lines.map((l) => (
            <div key={l.productId} className={l.productId === variant?.productId ? o.lineActive : o.line}>
              <button type="button" className={o.lineMain} onClick={() => selectVariant(l.productId)}
                aria-label={`${l.color}: ${sizeList(l.sizes)}`}>
                <i style={{ background: l.hex }} />
                <span className={o.lineName}>{l.color}<small>{sizeList(l.sizes)}</small></span>
                <span className={o.lineSum}>{l.qty} шт<small>{rub(l.total)}</small></span>
              </button>
              <button type="button" className={o.lineDel} aria-label={`Убрать ${l.color} из заявки`} title="Убрать из заявки"
                onClick={() => { clearSizes(l.productId); track('color_remove'); }}>
                <Icon name="close" size={14} />
              </button>
            </div>
          ))}
          {lines.length > 1 && <p className={o.total}>Итого: <b>{price!.qty} шт</b></p>}
        </div>
      )}
      {elsewhere.map(({ g, qty }) => (
        <p key={g.id} className={o.elsewhere}>
          У модели «{g.name}» набрано {qty} шт — они не в этой заявке: в одной заявке одна модель.{' '}
          <button type="button" className={o.inlineLink} onClick={() => openGarment(g.id)}>Открыть</button>
        </p>
      ))}

      {price?.current && price.current.sides.length > 0 && (
        <div className={o.card}>
          {lines.length > 1 && <div className={`${o.row} ${o.plain}`}><span className={o.note}>Цена за шт · {price.current.color}</span></div>}
          <div className={o.row}>
            <span>Изделие{price.current.garment < price.current.garmentFull && <span className={o.promo}>{PROMO_TEXT.badge}</span>}</span>
            <span>
              {price.current.garment < price.current.garmentFull && <s className={o.old}>{rub(price.current.garmentFull)}</s>}
              {rub(price.current.garment)}
            </span>
          </div>
          {price.current.sides.map((x) => (
            <div key={x.side} className={o.row}>
              <span>
                Печать: {SIDE_LABEL[x.side].toLowerCase()} · {x.format}
                {x.oversize && <span className={o.note}> (крупнее формата — уточнит менеджер)</span>}
              </span>
              <span>{rub(x.price)}</span>
            </div>
          ))}
          {price.tierFrom > 1 && <div className={`${o.row} ${o.plain}`}><span className={o.note}>Цена печати за тираж от {price.tierFrom} шт</span></div>}
          {price.next && (
            <div className={o.badge}>
              <Icon name="discount" size={16} />От {price.next.qty} шт дешевле — {rub(price.next.perItem)} за шт
            </div>
          )}
        </div>
      )}
    </>
  );
}

/** Закреплённый итог: сумма и кнопка заявки (дизайн → размеры → заявка). */
/** Плавный пересчёт числа (~0,4 с, ease-out); при reduced-motion — сразу. */
function CountUp({ value }: { value: number }) {
  const [shown, setShown] = useState(value);
  const cur = useRef(value);
  useEffect(() => {
    const from = cur.current;
    if (from === value) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      cur.current = value;
      setShown(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (now: number) => {
      const k = Math.min(1, (now - t0) / 400);
      const v = Math.round(from + (value - from) * (1 - Math.pow(1 - k, 3)));
      cur.current = v;
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <>{rub(shown)}</>;
}

export function OrderFooter({ price, hasDesign, blocked = false, onAddToCart, adding = false, addLabel = 'В корзину' }: {
  price: Price | null;
  hasDesign: boolean;
  /** Принт выходит за зону печати: кнопка ведёт к проблемному слою. */
  blocked?: boolean;
  /** Главная кнопка кладёт изделие в корзину; заявку оформляют уже в корзине. */
  onAddToCart: () => void;
  /** Холст снимает превью для корзины. */
  adding?: boolean;
  addLabel?: string;
}) {
  const one = price?.lines.length === 1 ? price.lines[0] : null;
  const label = !hasDesign ? 'Добавить принт' : blocked ? 'Принт вне зоны' : !price?.qty ? 'Выбрать размеры'
    : adding ? 'Сохраняем…' : addLabel;
  return (
    <footer className={`${s.footer} ${o.footer}`}>
      <div className={o.footerPrice}>
        <div className={o.sum} data-testid="constructor-total">{price ? <CountUp value={price.qty ? price.total : price.current?.perItem ?? 0} /> : '—'}</div>
        {price?.qty ? (
          <p className={o.sub2}>{one ? `${one.qty} шт · ${rub(one.perItem)} за шт` : `${price.qty} шт · ${colorsWord(price.lines.length)}`}</p>
        ) : price?.current ? (
          <p className={o.sub2}>за 1 шт</p>
        ) : null}
      </div>
      {/* Кнопка всегда активна: до заявки она ведёт к следующему шагу (на телефоне это единственный путь вперёд) */}
      <button type="button" className={o.button} onClick={onAddToCart} aria-busy={adding || undefined}>
        {label}
      </button>
    </footer>
  );
}
