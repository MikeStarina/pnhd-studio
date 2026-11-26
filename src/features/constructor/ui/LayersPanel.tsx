'use client';
import { useState } from 'react';
import { useConstructor } from '../model/store';
import type { DesignLayer } from '../model/types';
import { ClearPrompt } from './ClearPrompt';
import { Icon } from './icons';
import s from './constructor.module.css';
import d from './design.module.css';

const label = (l: DesignLayer) => (l.kind === 'image' ? l.fileName : l.text.trim() || 'Пустой текст');

interface Props {
  hex: string;
  open?: boolean;
  onToggle?: () => void;
  /** Встроенный вид (под карточками на телефоне): без сворачивания, список всегда раскрыт, пустой — не показывается. */
  embedded?: boolean;
}

/**
 * Слои текущей стороны: сверху — то, что нарисовано поверх. Тап по строке выбирает слой
 * (так можно достать картинку, перекрытую другой), кнопки меняют порядок, дублируют и удаляют.
 */
export function LayersPanel({ hex, open = true, onToggle, embedded = false }: Props) {
  const side = useConstructor((st) => st.side);
  const layers = useConstructor((st) => st.layers);
  const selectedId = useConstructor((st) => st.selectedLayerId);
  const { selectLayer, moveLayer, duplicateLayer, removeLayer, toggleHidden, clearAll } = useConstructor.getState();
  const [confirmClear, setConfirmClear] = useState(false);

  const sideLayers = layers.filter((l) => l.side === side);
  const top = [...sideLayers].reverse();

  // «Очистить всё» — по слоям всех сторон: кнопка нужна, даже если на этой стороне пусто.
  const clearBtn = layers.length > 0 && (
    <button type="button" className={d.clearBtn} onClick={() => setConfirmClear(true)}>
      <Icon name="trash" size={16} />Очистить всё
    </button>
  );
  const clearDialog = confirmClear && (
    <ClearPrompt count={layers.length} onConfirm={() => { clearAll(); setConfirmClear(false); }} onCancel={() => setConfirmClear(false)} />
  );

  if (embedded && !top.length) return layers.length ? <div className={d.clearRow}>{clearBtn}{clearDialog}</div> : null;

  return (
    <>
      {embedded ? (
        <div className={d.clearRow}>
          <h4 className={d.headSmall}>На этой стороне · {top.length}</h4>
          {clearBtn}
        </div>
      ) : (
        <div className={d.head}>
          <div className={d.titleWrap}>
            <h3 className={s.h}>Слои</h3>
            <span className={d.count}>{top.length}</span>
          </div>
          {clearBtn}
          {/* На мобильном слои — отдельная вкладка, сворачивать нечего. */}
          <button
            type="button" className={`${d.collapse} ${s.desktopOnly}`} onClick={onToggle} aria-expanded={open}
            aria-label={open ? 'Свернуть слои' : 'Развернуть слои'} title={open ? 'Свернуть' : 'Развернуть'}
          >
            <Icon name={open ? 'chevronUp' : 'chevronDown'} size={18} />
          </button>
        </div>
      )}
      {!top.length && (
        <p className={d.empty}><Icon name="layers" size={18} />Пока пусто — добавь картинку или текст.</p>
      )}
      {/* s.layers нужен мобильной вёрстке: там список не сворачивается. */}
      <ul className={`${s.layers} ${d.list} ${top.length === 1 ? d.single : ''}`} hidden={embedded ? undefined : !open}>
        {top.map((l, i) => {
          const active = l.id === selectedId;
          return (
            <li key={l.id} className={`${active ? d.layerActive : d.layer} ${l.hidden ? d.layerHidden : ''}`}>
              <button
                type="button" className={d.main} onClick={() => selectLayer(l.id)} aria-pressed={active}
                aria-disabled={l.hidden || undefined} title={l.hidden ? `${label(l)} — скрыт` : label(l)}
              >
                <span className={s.thumb} style={{ background: hex }} aria-hidden>
                  {l.kind === 'image' ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={l.src} alt="" />
                  ) : (
                    <span style={{ color: l.fill, fontFamily: l.fontFamily }}>Aa</span>
                  )}
                </span>
                <span className={d.names}>
                  <span className={d.name}>{label(l)}</span>
                  <span className={d.kind}>{l.kind === 'image' ? 'Картинка' : 'Текст'}</span>
                </span>
              </button>
              {/* Глаз виден всегда (и у скрытого слоя тоже): это единственный способ его вернуть. */}
              <button
                type="button" className={l.hidden ? `${d.act} ${d.actEye} ${d.actEyeOff}` : `${d.act} ${d.actEye}`}
                onClick={() => toggleHidden(l.id)} aria-pressed={!!l.hidden}
                aria-label={l.hidden ? 'Показать' : 'Скрыть'} title={l.hidden ? 'Показать' : 'Скрыть'}
              ><Icon name={l.hidden ? 'eyeOff' : 'eye'} size={18} /></button>
              <div className={d.actions2}>
                {/* При одном слое порядок менять нечего — на телефоне эти кнопки скрыты (.single) */}
                <button type="button" className={`${d.act} ${d.reorder}`} onClick={() => moveLayer(l.id, 1)} disabled={i === 0} aria-label="Выше" title="Выше"><Icon name="arrowUp" size={18} /></button>
                <button type="button" className={`${d.act} ${d.reorder}`} onClick={() => moveLayer(l.id, -1)} disabled={i === top.length - 1} aria-label="Ниже" title="Ниже"><Icon name="arrowDown" size={18} /></button>
                <button type="button" className={d.act} onClick={() => duplicateLayer(l.id)} aria-label="Дублировать" title="Дублировать"><Icon name="copy" size={18} /></button>
                <button type="button" className={`${d.act} ${d.actDanger}`} onClick={() => removeLayer(l.id)} aria-label="Удалить" title="Удалить"><Icon name="trash" size={18} /></button>
              </div>
            </li>
          );
        })}
      </ul>
      {clearDialog}
    </>
  );
}
