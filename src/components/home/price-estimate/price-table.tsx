'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import BrandMark from '../../site/brand-mark/brand-mark';
import PriceStage, { type Fabric } from './price-stage';
import CountUp from './count-up';
import { priceMethods } from './prices';
import styles from './price-table.module.css';

const rub = (value: number) => `${value.toLocaleString('ru-RU')} ₽`;
const cm = (value: number) => value.toLocaleString('ru-RU');

const fabrics: { id: Fabric; name: string }[] = [
  { id: 'white', name: 'Белая' },
  { id: 'colored', name: 'Цветная' },
];

/** Формат, который показан на футболке, пока ничего не выбрано */
const DEFAULT_FORMAT = 'А4';

const PriceTable: React.FC = () => {
  const [methodId, setMethodId] = useState(priceMethods[0].id);
  const [fabric, setFabric] = useState<Fabric>('white');
  const [picked, setPicked] = useState(DEFAULT_FORMAT);
  const [hovered, setHovered] = useState<string | null>(null);
  const method = priceMethods.find((item) => item.id === methodId) ?? priceMethods[0];
  const active =
    method.formats.find((format) => format.name === (hovered ?? picked)) ??
    method.formats.find((format) => format.name === DEFAULT_FORMAT) ??
    method.formats[0];
  // У DTG две цены — на белой и на цветной ткани; у остальных методов цвет ткани на цену не влияет
  const column = method.columns.length > 1 && fabric === 'colored' ? 1 : 0;
  const priceOf = (prices: number[]) => prices[Math.min(column, prices.length - 1)];

  const onTabKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
    const index = priceMethods.findIndex((item) => item.id === methodId);
    const next = priceMethods[(index + (event.key === 'ArrowRight' ? 1 : priceMethods.length - 1)) % priceMethods.length];
    setMethodId(next.id);
    document.getElementById(`price-tab-${next.id}`)?.focus();
  };

  return (
    <div className={styles.wrap}>
      <div className={styles.bar}>
        <div className={styles.tabs} role="tablist" aria-label="Метод нанесения" onKeyDown={onTabKey}>
          {priceMethods.map((item) => (
            <button
              key={item.id}
              id={`price-tab-${item.id}`}
              type="button"
              role="tab"
              className={styles.tab}
              aria-selected={item.id === methodId}
              aria-controls="price-tab-panel"
              tabIndex={item.id === methodId ? 0 : -1}
              onClick={() => setMethodId(item.id)}
            >
              {item.name}
            </button>
          ))}
        </div>
        <div className={styles.fabrics} role="group" aria-label="Цвет ткани">
          {fabrics.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.fabric}
              data-fabric={item.id}
              aria-pressed={item.id === fabric}
              onClick={() => setFabric(item.id)}
            >
              <span className={styles.swatch} aria-hidden />
              {item.name}
            </button>
          ))}
        </div>
      </div>

      <div className={styles.body}>
        <figure className={styles.figure}>
          <PriceStage format={active} fabric={fabric} />
          <p className={styles.sticker}>
            <BrandMark name="star-8" size={14} />
            На твоей вещи — та же цена
          </p>
          <figcaption className={styles.figcaption}>
            <span>
              <span className={styles.figName}>{active.name}</span>
              <span className={styles.figSize}>
                {active.name === 'Мини' ? 'до\u00a0' : ''}
                {cm(active.w)}×{cm(active.h)}&nbsp;см
              </span>
            </span>
            <span className={styles.figPrice}>
              <CountUp value={priceOf(active.prices)} format={rub} />
            </span>
          </figcaption>
        </figure>

        <div key={method.id} id="price-tab-panel" className={styles.panel} role="tabpanel" aria-labelledby={`price-tab-${method.id}`}>
          <table className={styles.table} onMouseLeave={() => setHovered(null)}>
            <caption className={styles.caption}>Цены {method.name}: за один принт по формату</caption>
            <thead>
              <tr>
                <th scope="col" className={styles.th}>Формат</th>
                <th scope="col" className={`${styles.th} ${styles.price}`}>
                  {method.columns.length > 1 ? `На ${fabric === 'white' ? 'белой' : 'цветной'} ткани` : 'Цена'}
                </th>
              </tr>
            </thead>
            <tbody>
              {method.formats.map((format) => (
                <tr
                  key={format.name}
                  className={styles.row}
                  data-active={format.name === active.name || undefined}
                  onMouseEnter={() => setHovered(format.name)}
                  onClick={() => setPicked(format.name)}
                >
                  <th scope="row" className={styles.format}>
                    <button
                      type="button"
                      className={styles.pick}
                      aria-pressed={format.name === active.name}
                      onFocus={() => setHovered(format.name)}
                      onBlur={() => setHovered(null)}
                    >
                      {format.name}
                      <span className={styles.size}>
                        {format.name === 'Мини' ? 'до ' : ''}
                        {cm(format.w)}×{cm(format.h)}&nbsp;см
                      </span>
                    </button>
                  </th>
                  <td className={styles.price}>{rub(priceOf(format.prices))}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className={styles.foot}>
            <p className={styles.note}>
              Цена — за один принт на одной стороне вещи.{' '}
              {method.note ?? 'Скидки на тираж от\u00a010\u00a0штук — у\u00a0менеджера'}
            </p>
            <div className={styles.links}>
              <Link href={`/methods/${method.slug}`} className={styles.more}>
                О методе&nbsp;<Icon name="arrowRight" size="1.25em" stroke={2} />
              </Link>
              <Link href="/constructor" className={`${styles.more} ${styles.build}`}>
                Собрать в конструкторе&nbsp;<Icon name="arrowRight" size="1.25em" stroke={2} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceTable;
