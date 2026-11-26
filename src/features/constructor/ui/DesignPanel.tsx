'use client';
import type { RefObject } from 'react';
import type { DesignStageHandle } from '../canvas/DesignStage';
import { printAreaFor } from '../config/print-areas';
import { PLACE_LABEL, placesOf } from '../model/placement';
import { areaAspect, quarterTurn } from '../model/crop';
import { layerOverflows } from '../model/overflow';
import { imageDpi, MIN_DPI } from '../model/quality';
import { selectGarment, useConstructor } from '../model/store';
import { SIDE_LABEL, SIDE_TAB, type PhotoShape } from '../model/types';
import { ShapePicker } from './ShapePicker';
import { GROUP_ID } from '../canvas/group';
import { isLetterSlot } from '../model/slot';
import type { DesignLayer, PlaceSpot } from '../model/types';

/** Предупреждение: принт вышел за зону печати — часть не напечатается. Кнопка возвращает его в зону. */
function OverflowWarn({ onFit }: { onFit: () => void }) {
  return (
    <div className={d.overflowBox} role="alert">
      <p className={`${d.badge} ${d.badgeWarn}`}>
        <Icon name="alert" size={18} />
        <span>Часть принта за границей зоны печати — она не напечатается. Сдвинь или уменьши.</span>
      </p>
      <button type="button" className={d.slotBtn} onClick={onFit}>
        <Icon name="fit" size={20} />Вписать в зону
      </button>
    </div>
  );
}

/** Быстрое размещение: стандартные места нанесения от шва горловины (на сердце, по центру груди, на спине). */
function PlaceRow({ places, onPlace }: { places: PlaceSpot[]; onPlace: (spot: PlaceSpot) => void }) {
  if (!places.length) return null;
  return (
    <div className={d.placeRow} role="group" aria-label="Место нанесения">
      {places.map((spot) => (
        <button key={spot} type="button" className={d.placeBtn} onClick={() => onPlace(spot)}>{PLACE_LABEL[spot]}</button>
      ))}
    </div>
  );
}

/** Подпись слоя в списке готового принта. */
const memberLabel = (l: DesignLayer) =>
  l.kind === 'text' ? `«${l.text.replace(/\s+/g, ' ').trim().slice(0, 28) || 'Пустой текст'}»`
    : isLetterSlot(l) && l.mask?.kind === 'text' ? `Буква «${l.mask.text}»${l.placeholder ? ' — без фото' : ''}`
    : l.slot !== undefined ? (l.placeholder ? 'Место под фото' : 'Фото') : 'Графика';
import { Icon, type IconName } from './icons';
import { TextPanel } from './TextPanel';
import s from './constructor.module.css';
import d from './design.module.css';

interface Props {
  stage: RefObject<DesignStageHandle>;
  fileError: string | null;
  onUpload: () => void;
  onAddText: () => void;
  /** Открыть каталог готовых принтов; без пропа карточка «Готовые принты» не показывается. */
  onTemplates?: () => void;
  /** Вставить своё фото в место под фото из готового принта (id слоя). */
  onReplacePhoto?: (id: string) => void;
  /** Поменять слово, по буквам которого обрезано фото. */
  onMaskText?: (id: string, text: string) => void;
  /** Открыть кадрирование картинки (id слоя). */
  onCrop?: (id: string) => void;
  /** Форма обрезки своего фото; null — без формы. */
  onShape?: (id: string, shape: PhotoShape | null) => void;
  /** Новое слово у готового принта «снимок в каждой букве» (id группы). */
  onGroupWord?: (group: string, word: string) => void;
}

/**
 * Правая панель «Дизайн» зависит от выбора на холсте:
 * ничего не выбрано — три крупных входа (готовые принты, картинка, текст); текст — настройки текста; картинка — её параметры.
 */
export function DesignPanel({ stage, fileError, onUpload, onAddText, onTemplates, onReplacePhoto, onMaskText, onCrop, onShape, onGroupWord }: Props) {
  const side = useConstructor((st) => st.side);
  const garment = useConstructor(selectGarment);
  const selected = useConstructor((st) => st.layers.find((l) => l.id === st.selectedLayerId));
  const { updateLayer, selectLayer, selectGroup, ungroup } = useConstructor.getState();
  // Выбран готовый принт целиком (группа из нескольких слоёв этой стороны).
  const groupId = useConstructor((st) => st.selectedGroup);
  const layersAll = useConstructor((st) => st.layers);
  const members = groupId ? layersAll.filter((l) => l.group === groupId && l.side === side && !l.hidden) : [];
  const group = !selected && members.length > 1 ? groupId : null;
  const inGroup = selected?.group && layersAll.filter((l) => l.group === selected.group && l.side === side && !l.hidden).length > 1 ? selected.group : null;

  // fontTick: габарит текста зависит от загруженного шрифта — предупреждение пересчитывается вместе с ним.
  useConstructor((st) => st.fontTick);
  const isPlaceholder = (l: DesignLayer) => l.kind === 'image' && !!l.placeholder;
  const selectedOut = !!(selected && garment && !isPlaceholder(selected) && layerOverflows(garment, selected));
  const groupOut = !!(group && garment && members.some((l) => !isPlaceholder(l) && layerOverflows(garment, l)));

  const places = garment ? placesOf(printAreaFor(garment, side)) : [];

  const dpi = selected?.kind === 'image' && garment
    ? imageDpi(selected, printAreaFor(garment, selected.side).widthCm, selected.isVector)
    : null;

  // Действия со слоем: одна сегментная панель иконок
  const actions: Array<{ icon: IconName; label: string; run: () => void; pressed?: boolean }> = selected ? [
    { icon: 'alignCenterX', label: 'По центру по горизонтали', run: () => stage.current?.align(selected.id, 'centerX') },
    { icon: 'alignCenterY', label: 'По центру по вертикали', run: () => stage.current?.align(selected.id, 'centerY') },
    { icon: 'fit', label: 'Вписать: максимальный размер в зоне печати', run: () => stage.current?.align(selected.id, 'fit') },
    { icon: 'flip', label: 'Отразить по горизонтали', run: () => updateLayer(selected.id, { flipX: !selected.flipX }), pressed: !!selected.flipX },
    { icon: 'flipV', label: 'Отразить по вертикали', run: () => updateLayer(selected.id, { flipY: !selected.flipY }), pressed: !!selected.flipY },
    ...(garment ? [{ icon: 'rotate' as const, label: 'Повернуть на 90°', run: () => updateLayer(selected.id, quarterTurn(selected, areaAspect(garment, selected))) }] : []),
  ] : [];

  const kindLabel = selected?.kind === 'text' ? 'Текст' : 'Картинка';

  return (
    <>
      {!selected && !group ? (
        <>
          <h3 className={s.h}><span className={s.hNum} aria-hidden>2</span>Принт · {SIDE_LABEL[side]}</h3>
          <div className={d.actions}>
            {/* Главная карточка во всю ширину сверху, две остальные — в ряд под ней */}
            <button type="button" className={d.cardPrimary} onClick={onUpload}>
              <Icon name="upload" size={24} />
              <span className={d.cardText}>
                <span className={d.cardTitlePrimary}>Загрузить картинку</span>
                <span className={d.cardNote}>PNG, JPG, SVG · до 15 МБ</span>
              </span>
            </button>
            {onTemplates && (
              <button type="button" className={d.card} onClick={onTemplates}>
                <Icon name="brush" size={22} />
                <span className={d.cardText}>
                  <span className={d.cardTitle}>Готовые принты</span>
                  <span className={d.cardNote}>Выбери и поменяй текст</span>
                </span>
              </button>
            )}
            <button type="button" className={d.card} onClick={onAddText}>
              <Icon name="textFont" size={22} />
              <span className={d.cardText}>
                <span className={d.cardTitle}>Добавить текст</span>
              </span>
            </button>
          </div>
        </>
      ) : null}
      {fileError && <p className={s.err}>{fileError}</p>}

      {group && (
        <div className={d.body} key={group}>
          <div className={d.editHead}>
            <span className={d.chip}>
              <span className={d.chipIcon}><Icon name="brush" size={18} /></span>
              Готовый принт
              <span className={d.chipSide}>· {SIDE_TAB[side]}</span>
            </span>
            <button type="button" className={d.doneBtn} onClick={() => selectLayer(null)} title="Готово (Esc)">
              <Icon name="checkMark" size={18} />Готово
            </button>
          </div>
          {/* Пустое место под фото — главное действие с готовым принтом, без лишнего шага. */}
          {onReplacePhoto && (() => {
            const empty = members.find((l) => l.kind === 'image' && l.placeholder);
            return empty ? (
              <button type="button" className={d.slotBtnMain} onClick={() => onReplacePhoto(empty.id)}>
                <Icon name="upload" size={20} />Вставить своё фото
              </button>
            ) : null;
          })()}
          {onGroupWord && members.some(isLetterSlot) && (
            <label className={d.maskField}>
              <span>Слово</span>
              <input
                className={d.maskInput} maxLength={10} autoCapitalize="characters" enterKeyHint="done"
                value={members.filter(isLetterSlot).map((l) => (l.kind === 'image' && l.mask?.kind === 'text' ? l.mask.text : '')).join('')}
                onChange={(e) => { const w = e.target.value.toUpperCase().replace(/\s+/g, ''); if (w) onGroupWord(group, w); }}
              />
            </label>
          )}
          <p className={d.note}>Принт двигается, поворачивается и меняет размер целиком. Чтобы поменять текст или фото — нажми на него ещё раз или выбери здесь:</p>
          <div className={d.groupList}>
            {members.map((l) => (
              <button key={l.id} type="button" className={d.slotBtn} onClick={() => selectLayer(l.id)}>
                <Icon name={l.kind === 'text' ? 'text' : 'image'} size={18} />
                <span className={d.groupItem}>{memberLabel(l)}</span>
              </button>
            ))}
          </div>
          {groupOut && <OverflowWarn onFit={() => stage.current?.align(`${GROUP_ID}${group}`, 'fit')} />}
          <PlaceRow places={places} onPlace={(spot) => stage.current?.place(`${GROUP_ID}${group}`, spot)} />
          <div className={d.seg} role="group" aria-label="Положение и размер">
            {([
              { icon: 'alignCenterX', label: 'По центру по горизонтали', mode: 'centerX' },
              { icon: 'alignCenterY', label: 'По центру по вертикали', mode: 'centerY' },
              { icon: 'fit', label: 'Вписать: максимальный размер в зоне печати', mode: 'fit' },
            ] as const).map((a) => (
              <button
                key={a.icon} type="button" className={d.segBtn} title={a.label} aria-label={a.label}
                onClick={() => stage.current?.align(`${GROUP_ID}${group}`, a.mode)}
              ><Icon name={a.icon} size={20} /></button>
            ))}
            <button
              type="button" className={d.segBtn} title="Разъединить: двигать слои по отдельности" aria-label="Разъединить"
              onClick={() => ungroup(group)}
            ><Icon name="layers" size={20} /></button>
          </div>
        </div>
      )}

      {selected && (
        <div className={d.body} key={selected.id}>
          {/* Режим редактирования: шапка закреплена, «Готово» всегда под рукой и возвращает обычный вид панели. */}
          <div className={d.editHead}>
            <span className={d.chip}>
              <span className={d.chipIcon}><Icon name={selected.kind === 'text' ? 'text' : 'image'} size={18} /></span>
              {kindLabel}
              <span className={d.chipSide}>· {SIDE_TAB[side]}</span>
            </span>
            <button type="button" className={d.doneBtn} onClick={() => selectLayer(null)} title="Готово (Esc)">
              <Icon name="checkMark" size={18} />Готово
            </button>
          </div>

          {inGroup && (
            <button type="button" className={d.slotBtn} onClick={() => selectGroup(inGroup)}>
              <Icon name="brush" size={18} />Весь принт: двигать целиком
            </button>
          )}
          {selected.kind === 'text' && <TextPanel layer={selected} />}

          {selected.kind === 'image' && selected.mask?.kind === 'text' && onMaskText && (
            <label className={d.maskField}>
              <span>Слово</span>
              <input
                className={d.maskInput} value={selected.mask.text} maxLength={14} autoCapitalize="characters" enterKeyHint="done"
                onChange={(e) => onMaskText(selected.id, e.target.value.toUpperCase())}
              />
            </label>
          )}
          {selected.kind === 'image' && selected.slot !== undefined && onReplacePhoto && (
            <button type="button" className={selected.placeholder ? d.slotBtnMain : d.slotBtn} onClick={() => onReplacePhoto(selected.id)}>
              <Icon name="upload" size={20} />{selected.placeholder ? 'Вставить своё фото' : 'Заменить фото'}
            </button>
          )}
          {selected.kind === 'image' && !selected.placeholder && dpi !== null && (
            <p className={`${d.badge} ${dpi >= MIN_DPI ? '' : d.badgeWarn}`}>
              <Icon name={dpi >= MIN_DPI ? 'check' : 'alert'} size={18} />
              <span>
                {dpi === Infinity
                  ? 'Векторный файл — качество отличное.'
                  : dpi >= MIN_DPI
                    ? `Качество печати хорошее (${dpi} dpi).`
                    : `Низкое разрешение (${dpi} dpi) — при таком размере печать может выйти нечёткой. Уменьши картинку или загрузи файл побольше.`}
              </span>
            </p>
          )}
          {selectedOut && <OverflowWarn onFit={() => stage.current?.align(selected.id, 'fit')} />}
          {selected.kind === 'image' && !selected.placeholder && onCrop && (
            <button type="button" className={d.slotBtn} onClick={() => onCrop(selected.id)}>
              <Icon name="crop" size={20} />{selected.slot !== undefined ? 'Подвинуть фото в рамке' : 'Кадрировать'}
            </button>
          )}
          {selected.kind === 'image' && onShape && selected.slot === undefined && !selected.placeholder && !selected.isVector
            && (!selected.mask || selected.mask.kind === 'shape') && (
            <ShapePicker
              value={selected.mask?.kind === 'shape' ? selected.mask.shape : null}
              onChange={(sh) => onShape(selected.id, sh)}
            />
          )}
          {selected.kind === 'image' && selected.crop && selected.slot === undefined && !selected.cropped && !selected.mask && (
            <p className={d.note}>Пустые поля по краям убрали — размер и цена считаются по самому рисунку.</p>
          )}

          <PlaceRow places={places} onPlace={(spot) => stage.current?.place(selected.id, spot)} />
          <div className={d.seg} role="group" aria-label="Положение и размер">
            {actions.map((a) => (
              <button
                key={a.icon} type="button" className={d.segBtn} title={a.label} aria-label={a.label}
                aria-pressed={a.pressed} onClick={a.run}
              ><Icon name={a.icon} size={20} /></button>
            ))}
          </div>
        </div>
      )}
    </>
  );
}
