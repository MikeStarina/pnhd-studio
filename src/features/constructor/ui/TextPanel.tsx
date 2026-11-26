'use client';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { FONT_GROUPS, FONTS, fontDef, TEXT_COLORS } from '../config/fonts';
import { ensureFont, onFontLoaded } from '../model/fonts';
import { useConstructor } from '../model/store';
import type { TextLayer } from '../model/types';
import { Icon, type IconName } from './icons';
import d from './design.module.css';

const ALIGNS: Array<[TextLayer['align'], string, IconName]> = [
  ['left', 'По левому краю', 'alignLeft'], ['center', 'По центру', 'alignCenter'], ['right', 'По правому краю', 'alignRight'],
];

/** Текст по умолчанию у нового слоя (как в store.addText): пока он не тронут, поле сразу в фокусе. */
const DEFAULT_TEXT = 'Твой текст';

/** Группы настроек: на телефоне показывается одна, на десктопе — все подряд лентой. */
type Group = 'text' | 'font' | 'color' | 'shape';
const GROUPS: Array<[Group, string]> = [['text', 'Текст'], ['font', 'Шрифт'], ['color', 'Цвет'], ['shape', 'Форма']];

const fontStyle = (family: string) => ({ fontFamily: `"${family}", Arial, sans-serif` });

interface RangeProps {
  label: string; value: number; shown: string; min: number; max: number; step: number; ariaLabel?: string;
  onChange: (v: number) => void;
}
/** Ползунок: подпись слева, значение справа. */
function Range({ label, value, shown, min, max, step, ariaLabel, onChange }: RangeProps) {
  return (
    <label className={d.range}>
      <span className={d.rangeHead}><span>{label}</span><span className={d.rangeVal}>{shown}</span></span>
      <input type="range" min={min} max={max} step={step} value={value} aria-label={ariaLabel}
        onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

/** Все настройки выбранного текста: сам текст, шрифт (раскрывающийся список), стиль, форма. */
export function TextPanel({ layer }: { layer: TextLayer }) {
  const { updateLayer } = useConstructor.getState();
  const [, tick] = useState(0);
  const [fontsOpen, setFontsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [group, setGroup] = useState<Group>('text');
  const def = fontDef(layer.fontFamily);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const stripRef = useRef<HTMLDivElement>(null);

  // Только что созданный текст: фокус и выделение, чтобы сразу печатать своё.
  // Панель пересоздаётся на каждый слой (key), поэтому достаточно монтирования; изменённый текст фокус не получает.
  useEffect(() => {
    if (layer.text !== DEFAULT_TEXT) return;
    const el = areaRef.current;
    if (!el) return;
    el.focus({ preventScroll: true });
    el.select();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Лента шрифтов на телефоне: при открытии группы выбранный шрифт показываем в поле зрения
  // (пока группа скрыта, у ленты нет ширины, поэтому считаем в момент показа).
  useEffect(() => {
    if (group !== 'font') return;
    const strip = stripRef.current;
    const active = strip?.querySelector<HTMLElement>('[aria-pressed="true"]');
    if (strip && active) strip.scrollLeft = active.offsetLeft - (strip.clientWidth - active.offsetWidth) / 2;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group]);
  const set = (patch: Partial<TextLayer>, mode: 'commit' | 'merge' = 'commit') => updateLayer(layer.id, patch, mode);

  // Превью строк — текст слоя нужным шрифтом, поэтому грузим все шрифты списка (только нужные буквы).
  const sample = layer.text.split('\n')[0].trim().slice(0, 18) || 'Аа Bb';
  useEffect(() => {
    const t = setTimeout(() => FONTS.forEach((f) => ensureFont(f.family, false, false, sample).catch(() => {})), 250);
    return () => clearTimeout(t);
  }, [sample]);
  useEffect(() => onFontLoaded(() => tick((n) => n + 1)), []);

  const pickFont = (family: string) => {
    const fd = fontDef(family);
    // У нового шрифта может не быть жирного/курсива — сбрасываем, чтобы файл печати совпал с выбором.
    set({ fontFamily: family, bold: layer.bold && !!fd?.bold, italic: layer.italic && !!fd?.italic });
    setFontsOpen(false);
  };

  // Поиск шрифта по названию без учёта регистра; один запрос на ленту телефона и список десктопа.
  const q = query.trim().toLowerCase();
  const shownFonts = q ? FONTS.filter((f) => f.family.toLowerCase().includes(q)) : FONTS;
  const search = (cls: string) => (
    <label className={`${d.fontSearch} ${cls}`}>
      <Icon name="search" size={18} />
      <input
        type="search" className={d.fontSearchInput} value={query} placeholder="Найти шрифт" aria-label="Найти шрифт"
        autoComplete="off" enterKeyHint="search" onChange={(e) => setQuery(e.target.value)}
      />
    </label>
  );

  const on = (g: Group) => (group === g ? 'true' : 'false');

  return (
    <>
      {/* Телефон: переключатель групп. Чипы всегда в разметке, на десктопе их прячет CSS. */}
      <div className={d.tabs} role="tablist" aria-label="Настройки текста">
        {GROUPS.map(([g, title]) => (
          <button
            key={g} type="button" role="tab" aria-selected={group === g}
            className={group === g ? d.tabActive : d.tab} onClick={() => setGroup(g)}
          >{title}</button>
        ))}
      </div>

      <div className={`${d.block} ${d.blockFirst}`} data-on={on('text')}>
        <div className={d.sub}>Текст</div>
        <textarea
          ref={areaRef} className={d.textarea} rows={2} value={layer.text} aria-label="Текст" placeholder="Введи текст"
          onChange={(e) => set({ text: e.target.value }, 'merge')}
        />
        <div className={d.seg} role="group" aria-label="Начертание и выравнивание">
          <button
            type="button" className={`${d.segBtn} ${d.compact}`} aria-pressed={layer.bold} disabled={!def?.bold && !layer.bold}
            title={def && !def.bold ? 'У этого шрифта нет жирного начертания' : 'Жирный'} aria-label="Жирный"
            onClick={() => set({ bold: !layer.bold })}
          ><Icon name="bold" size={20} /></button>
          <button
            type="button" className={`${d.segBtn} ${d.compact}`} aria-pressed={layer.italic} disabled={!def?.italic && !layer.italic}
            title={def && !def.italic ? 'У этого шрифта нет курсива' : 'Курсив'} aria-label="Курсив"
            onClick={() => set({ italic: !layer.italic })}
          ><Icon name="italic" size={20} /></button>
          {ALIGNS.map(([a, label, icon]) => (
            <button
              key={a} type="button" className={`${d.segBtn} ${d.compact}`} aria-pressed={layer.align === a}
              title={label} aria-label={label} onClick={() => set({ align: a })}
            ><Icon name={icon} size={20} /></button>
          ))}
        </div>
      </div>

      <div className={d.block} data-on={on('font')}>
        <div className={d.sub}>Шрифт</div>
        {/* Телефон: поле поиска и горизонтальная лента карточек */}
        {search(d.fontSearchMobile)}
        {!shownFonts.length && <p className={`${d.fontNone} ${d.fontNoneMobile}`}>Ничего не найдено</p>}
        <div className={d.fontStrip} ref={stripRef} role="group" aria-label="Шрифт" hidden={!shownFonts.length}>
          {shownFonts.map((f) => (
            <button
              key={f.family} type="button" aria-pressed={f.family === layer.fontFamily}
              className={f.family === layer.fontFamily ? d.fontCardActive : d.fontCard}
              onClick={() => pickFont(f.family)} title={f.family}
            >
              <span className={d.fontCardPreview} style={fontStyle(f.family)}>{sample}</span>
              <span className={d.fontCardName}>{f.family}</span>
            </button>
          ))}
        </div>
        <button
          type="button" className={`${d.desktopFont} ${fontsOpen ? `${d.fontSel} ${d.fontSelOpen}` : d.fontSel}`}
          aria-expanded={fontsOpen} onClick={() => setFontsOpen((o) => !o)} title="Выбрать шрифт"
        >
          <span className={d.fontPreview} style={fontStyle(layer.fontFamily)}>{sample}</span>
          <span className={d.fontName}>{layer.fontFamily}</span>
          <Icon name="chevronDown" size={18} />
        </button>
        {fontsOpen && search(d.desktopFont)}
        {fontsOpen && (
          <div className={`${d.desktopFont} ${d.fontList}`}>
            {!shownFonts.length && <p className={d.fontNone}>Ничего не найдено</p>}
            {FONT_GROUPS.map(([grp, title]) => shownFonts.some((f) => f.group === grp) && (
              <div key={grp} style={{ display: 'contents' }}>
                <div className={d.fontGroup}>{title}</div>
                {shownFonts.filter((f) => f.group === grp).map((f) => (
                  <button
                    key={f.family} type="button" aria-pressed={f.family === layer.fontFamily}
                    className={f.family === layer.fontFamily ? d.fontOptActive : d.fontOpt}
                    onClick={() => pickFont(f.family)} title={f.family}
                  >
                    <span className={d.fontPreview} style={fontStyle(f.family)}>{sample}</span>
                    <span className={d.fontName}>{f.family}</span>
                  </button>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className={d.block} data-on={on('color')}>
        <div className={d.sub}>Цвет</div>
        <div className={d.palette} role="group" aria-label="Цвет текста">
          {TEXT_COLORS.map((c) => (
            <button
              key={c} type="button" className={c === layer.fill.toLowerCase() ? d.dotActive : d.dot}
              style={{ '--c': c } as CSSProperties} aria-label={c} aria-pressed={c === layer.fill.toLowerCase()}
              onClick={() => set({ fill: c }, 'merge')}
            />
          ))}
          <label className={d.customColor} title="Свой цвет">
            <input type="color" className={d.colorInput} value={layer.fill} aria-label="Свой цвет"
              onChange={(e) => set({ fill: e.target.value }, 'merge')} />
            Свой
          </label>
        </div>
      </div>

      <div className={d.block} data-on={on('shape')}>
        <div className={d.sub}>Форма</div>
        <Range label="Межстрочный интервал" value={layer.lineHeight} shown={layer.lineHeight.toFixed(2)}
          min={0.8} max={2} step={0.05} onChange={(v) => set({ lineHeight: v }, 'merge')} />
        <Range label="Дуга" value={layer.arc} shown={String(layer.arc)} min={-100} max={100} step={1}
          ariaLabel="Изгиб текста дугой" onChange={(v) => set({ arc: v }, 'merge')} />
        <label className={d.switch}>
          <span>Обводка</span>
          <input type="checkbox" checked={layer.strokeWidth > 0} onChange={(e) => set({ strokeWidth: e.target.checked ? 0.06 : 0 })} />
          <span className={d.track} aria-hidden />
        </label>
        {layer.strokeWidth > 0 && (
          <div className={d.strokeRow}>
            <input type="color" className={d.colorInput} value={layer.strokeColor} aria-label="Цвет обводки"
              onChange={(e) => set({ strokeColor: e.target.value }, 'merge')} />
            <Range label="Толщина" value={layer.strokeWidth} shown={layer.strokeWidth.toFixed(2)}
              min={0.01} max={0.2} step={0.01} onChange={(v) => set({ strokeWidth: v }, 'merge')} />
          </div>
        )}
      </div>
    </>
  );
}
