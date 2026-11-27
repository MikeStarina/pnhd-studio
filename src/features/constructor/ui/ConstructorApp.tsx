'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useRef, useState } from 'react';
import { fetchCatalog, findBySlug, photosOf } from '../api/catalog';
import { track } from '../analytics/events';
import { getUtm } from '../analytics/utm';
import { readEntry, rememberEntry } from '@/components/site/analytics';
import { printAreaFor, sidesFor } from '../config/print-areas';
import { FRAME } from '../config/garment-shapes';
import { isLight } from '../canvas/tint';
import { designBounds } from '../model/bounds';
import { clearDraft, hasContent, loadDraft, restoreImages, saveDraft, type Draft, type DraftState, type SaveResult } from '../model/draft';
import { ensureFont, onFontLoaded } from '../model/fonts';
import { calcPrice, priceVariants } from '../model/pricing';
import { METHOD_INFO } from '../config/pricing';
import { validateFile, ACCEPT_ATTR, convertHeic, isHeic, MIN_DPI } from '../model/quality';
import { overflowingLayers } from '../model/overflow';
import { sideHasLayers, visibleLayers } from '../model/visibility';
import { canRedo, canUndo, selectGarment, selectVariant, useConstructor, variantQty } from '../model/store';
import { PHOTO_SHAPE } from '../config/photo-shapes';
import { maskOverlay } from '../canvas/masked';
import { applyCrop, applyShape, areaAspect } from '../model/crop';
import { coverCrop, isLetterSlot, letterBoxes, maskAspect, refitSlot } from '../model/slot';
import { letterSlots } from '../config/templates';
import { contentBox } from '../model/trim';
import { START_MAX_CM } from '../model/placement';
import { SIDE_LABEL, SIDE_TAB, type Garment, type ImageLayer, type PhotoShape } from '../model/types';
import type { DesignStageHandle } from '../canvas/DesignStage';
import type { CartDesign } from '../cart/types';
import { captureDesign } from '../export/captureDesign';
import { MAX_USER_ZOOM, ZOOM_STEP } from '../canvas/zoom';
import { GarmentPicker } from './GarmentPicker';
import { Icon } from './icons';
import { CropEditor } from './CropEditor';
import { DesignPanel } from './DesignPanel';
import { DraftPrompt } from './DraftPrompt';
import { LayersPanel } from './LayersPanel';
import { ModelInfo } from './ModelInfo';
import { OrderFooter, OrderPanel } from './OrderPanel';
import { SizeChart } from './SizeChart';
import { StepGuide, type GuideStep } from './StepGuide';
import { TemplatePicker } from './TemplatePicker';
import s from './constructor.module.css';

// Konva работает только в браузере.
const DesignStage = dynamic(() => import('../canvas/DesignStage').then((m) => m.DesignStage), {
  ssr: false,
  loading: () => <div className={s.stub}>Загружаем редактор…</div>,
});


/** Стрелка отмены; для повтора — зеркально. Символы ↶ ↷ в системных шрифтах выглядят по-разному. */
const HistoryIcon = ({ redo }: { redo?: boolean }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"
    strokeLinejoin="round" aria-hidden style={redo ? { transform: 'scaleX(-1)' } : undefined}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </svg>
);

/** Свёрнутый раздел правой колонки в режиме редактирования слоя. */
const SumRow = ({ title, meta, onClick }: { title: string; meta: string; onClick: () => void }) => (
  <button type="button" className={s.sumRow} onClick={onClick}>
    <span className={s.sumTitle}>{title}</span>
    <span className={s.sumMeta}>{meta}</span>
    <Icon name="chevronRight" size={18} />
  </button>
);

/** Шаги на телефоне: изделие → принт → размеры; четвёртый шаг — корзина — открывает кнопка в итоге. */
type Tab = 'garment' | 'design' | 'order';
/** Сдвиг пальца (px), с которого жест по ручке листа — это свайп, а не нажатие. */
const GRIP_SWIPE = 24;
/** Сколько ждать после ухода фокуса из поля, пока экранная клавиатура закроется (мс). */
const KEYBOARD_CLOSE_MS = 400;

export function ConstructorApp({ onAddToCart, initial, draftScope, addLabel, children }: {
  /**
   * Состояние, с которого открыть конструктор вместо черновика: правка позиции из корзины, принт на товар из корзины.
   * Вызывается один раз, когда каталог загружен; null — обычное открытие.
   */
  initial?: (garments: Garment[]) => Promise<{ start?: DraftState; notice?: string }>;
  /** Отдельный черновик для режима из `initial` (например, `edit:<id>`): незаконченная работа переживает перезагрузку. */
  draftScope?: string;
  /** Подпись главной кнопки вместо «В корзину» (например, при правке позиции). */
  addLabel?: string;
  /** Окна сайта поверх конструктора (например, «Добавлено в корзину»): внутри корня, чтобы работали стили модуля. */
  children?: React.ReactNode;
  /** Изделие с принтом снято и сохранено — положить в корзину сайта (adr/0001): заявку оформляют в корзине. */
  onAddToCart: (design: CartDesign) => void;
}) {
  const st = useConstructor();
  const garment = useConstructor(selectGarment);
  const variant = useConstructor(selectVariant);
  const stageRef = useRef<DesignStageHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  // Масштаб холста — кнопки в панели под холстом; DesignStage сбрасывает его при смене стороны и модели.
  const [zoom, setZoom] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  // Ошибка файла относится к последней попытке загрузки: выбрали слой или другую сторону — она больше не к месту.
  useEffect(() => { setFileError(null); }, [st.selectedLayerId, st.side]);
  const [layersOpen, setLayersOpen] = useState(true);
  const [dragOver, setDragOver] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const [tab, setTab] = useState<Tab>('garment');
  const [templatesOpen, setTemplatesOpen] = useState(false);
  const [photosOpen, setPhotosOpen] = useState(false);
  const photosBtn = useRef<HTMLButtonElement>(null);
  /** Слой-картинка, который сейчас кадрируют. */
  const [cropId, setCropId] = useState<string | null>(null);
  // Лист с настройками на телефоне: обычная высота или развёрнутый (холст при этом ниже).
  const [sheetFull, setSheetFull] = useState(false);
  const gripY = useRef<number | null>(null);
  const undoable = useConstructor(canUndo);
  const redoable = useConstructor(canRedo);
  const sides = sidesFor(garment);

  // Страница товара открывает конструктор с ?product=<slug>: запоминаем и убираем из адреса, остальные параметры остаются.
  const linkSlug = useRef<string | null>(null);
  useEffect(() => {
    const url = new URL(window.location.href);
    const slug = url.searchParams.get('product');
    // Повторный запуск эффекта (StrictMode) параметра уже не видит — прежнее значение не затираем.
    if (slug === null) return;
    linkSlug.current = slug;
    if (slug) rememberEntry({ ...readEntry(), product: slug });
    url.searchParams.delete('product');
    window.history.replaceState(window.history.state, '', url);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    track('constructor_open');
    getUtm(); // запоминаем метки первого захода
    fetchCatalog(ac.signal).then(st.setCatalog).catch((e) => !ac.signal.aborted && setError(String(e.message ?? e)));
    return () => ac.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // На телефоне выбор принта на холсте открывает его настройки (шаг «Принт») — с любого шага.
  useEffect(() => {
    if (st.selectedLayerId || st.selectedGroup) setTab('design');
  }, [st.selectedLayerId, st.selectedGroup]);
  // Развёрнутый лист — только пока нужен: при смене шага возвращаем обычную высоту.
  useEffect(() => setSheetFull(false), [tab]);

  // Телефон: каждая вкладка прокручивается сама — при смене вкладки или слоя показываем её с начала.
  const appRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    appRef.current?.querySelectorAll<HTMLElement>('[data-section]').forEach((el) => { el.scrollTop = 0; });
  }, [tab, st.selectedLayerId, st.selectedGroup]);

  // Телефонная раскладка: при редактировании слоя холст приближается к зоне печати.
  const [narrow, setNarrow] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 900px)');
    const on = () => setNarrow(mq.matches);
    on();
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);

  // Экранная клавиатура: видимая область — в --vvh (высота) и --vvt (сдвиг сверху), пока клавиатура открыта — data-kb.
  // Раскладка закрепляется в видимой области над клавиатурой, чтобы изделие с текстом оставалось на виду во время набора.
  const [kb, setKb] = useState(false);
  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const update = () => {
      // Видимую область уменьшает не только клавиатура поля, но и зум, и клавиатура самого браузера (адресная строка):
      // без фокуса в поле конструктора экран застревал в раскладке набора — без шапки, цветов и итога.
      // vv.height приходит в увеличенных пикселях: без умножения на масштаб зум выглядит как клавиатура.
      const open = typingIn(appRef.current) && window.innerHeight - vv.height * vv.scale > 120 && window.matchMedia('(max-width: 900px)').matches;
      appRef.current?.style.setProperty('--vvh', `${Math.round(vv.height)}px`);
      appRef.current?.style.setProperty('--vvt', `${Math.round(vv.offsetTop)}px`);
      setKb(open);
      if (!open) return;
      // iOS сдвигает страницу к полю ввода; у нас прокручивается панель, а страница должна стоять на месте.
      window.scrollTo(0, 0);
      // После перестройки раскладки поле ввода — в видимой части своей панели.
      requestAnimationFrame(() => {
        (document.activeElement as HTMLElement | null)?.scrollIntoView?.({ block: 'nearest' });
        window.scrollTo(0, 0);
      });
    };
    // iOS сдвигает видимую область к полю ввода, не меняя её размер, — тогда приходит только scroll.
    const onScroll = () => appRef.current?.style.setProperty('--vvt', `${Math.round(vv.offsetTop)}px`);
    // Закрытие клавиатуры не каждый браузер сопровождает resize, поэтому перепроверяем и при смене фокуса.
    // После ухода фокуса ждём, пока клавиатура уедет: обычно resize приходит раньше и выключает раскладку сам.
    const onFocusOut = () => setTimeout(update, KEYBOARD_CLOSE_MS);
    update();
    vv.addEventListener('resize', update);
    vv.addEventListener('scroll', onScroll);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', onFocusOut);
    return () => {
      vv.removeEventListener('resize', update);
      vv.removeEventListener('scroll', onScroll);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', onFocusOut);
    };
  }, []);

  // Cmd/Ctrl+Z — отмена, Cmd/Ctrl+Shift+Z и Ctrl+Y — повтор, Delete — удалить выбранный слой.
  // Когда фокус в поле ввода, клавиши остаются полю (там своя отмена набора).
  useEffect(() => {
    if (templatesOpen || cropId) return;
    const onKey = (e: KeyboardEvent) => {
      // Esc — «Готово»: закрыть настройки слоя, даже из поля ввода (пока не открыта таблица размеров).
      if (e.key === 'Escape' && !chartOpen && (useConstructor.getState().selectedLayerId || useConstructor.getState().selectedGroup)) {
        (document.activeElement as HTMLElement | null)?.blur?.();
        useConstructor.getState().selectLayer(null);
        return;
      }
      const t = e.target as HTMLElement | null;
      if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName))) return;
      const st = useConstructor.getState();
      const mod = e.metaKey || e.ctrlKey;
      const key = e.key.toLowerCase();
      if (mod && (key === 'z' || e.code === 'KeyZ')) {
        e.preventDefault();
        if (e.shiftKey) st.redo(); else st.undo();
      } else if (mod && (key === 'y' || e.code === 'KeyY')) {
        e.preventDefault();
        st.redo();
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && (st.selectedLayerId || st.selectedGroup)) {
        e.preventDefault();
        if (st.selectedLayerId) st.removeLayer(st.selectedLayerId);
        else if (st.selectedGroup) st.removeGroup(st.selectedGroup);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [chartOpen, templatesOpen, cropId]);

  /** Макет и размеры, только что положенные в корзину (сравниваются по ссылке). */
  const sent = useRef<{ layers: unknown; quantities: unknown } | null>(null);
  /** Чем закончилось прошлое сохранение черновика. */
  const lastSave = useRef<SaveResult | null>(null);
  // Черновик: при открытии спрашиваем, продолжать ли; пока не ответили — ничего не сохраняем.
  const [draft, setDraft] = useState<Draft | null>(null);
  const [draftGate, setDraftGate] = useState<'wait' | 'ask' | 'open'>('wait');
  // Изделие и цвет из адреса: выбираем так же, как если бы посетитель сам нажал их в списке.
  const [linked, setLinked] = useState(false);
  const openLinked = () => {
    const found = linkSlug.current ? findBySlug(st.garments, linkSlug.current) : null;
    if (!found) return;
    st.selectGarment(found.garment.id);
    st.selectVariant(found.variant.productId);
    setLinked(true);
    // Выбор по ссылке — тот же шаг воронки, что и выбор руками: иначе пришедшие со страницы товара выпадают из воронки
    track('garment_select', { id: found.garment.id, via: 'link' });
    track('color_select', { color: found.variant.colorName, via: 'link' });
  };
  // Короткая подсказка по действию; сама гаснет.
  const [hint, setHint] = useState<string | null>(null);
  useEffect(() => {
    if (!hint) return;
    const t = setTimeout(() => setHint(null), 4000);
    return () => clearTimeout(t);
  }, [hint]);
  /** Показывает черновик на холсте; его картинки перед этим читаются из IndexedDB (restoreImages). */
  const openDraft = (d: Draft) => {
    st.hydrate(d);
    if (d.imagesDropped) setHint('Картинки из прошлого раза не сохранились — загрузи их заново.');
    setDraft(null);
    setDraftGate('open');
  };
  useEffect(() => {
    if (draftGate !== 'wait' || !st.garments.length) return;
    if (initial) {
      // Пока ответа нет — эффект не повторяется: ворота переходят в 'open' только по ответу.
      setDraftGate('ask');
      // Начатая и не положенная в корзину работа этого режима важнее стартового состояния.
      const own = loadDraft(draftScope);
      if (own && hasContent(own)) { restoreImages(own, draftScope).then(openDraft); return; }
      initial(st.garments).catch(() => ({ start: undefined, notice: undefined })).then(({ start, notice }) => {
        if (start) st.hydrate(start);
        else openLinked();
        if (notice) setHint(notice);
        setDraftGate('open');
      });
      return;
    }
    const d = loadDraft();
    // Чужой дизайн молча не затираем: с принтами в черновике сначала спрашиваем, товар из адреса — при «Начать новый».
    if (d && hasContent(d)) { setDraft(d); setDraftGate('ask'); return; }
    openLinked();
    setDraftGate('open');
  }, [draftGate, st.garments.length]);
  useEffect(() => {
    if (draftGate !== 'open') return;
    // Ровно то, что уже положено в корзину, в черновик не возвращаем (снимки сторон дёргают сторону и цвет).
    if (sent.current?.layers === st.layers && sent.current.quantities === st.quantities) return;
    // Правка позиции корзины или принт на товар из корзины пишут в свой черновик (draftScope), общий не трогают.
    if (initial && !draftScope) return;
    const t = setTimeout(async () => {
      const r = await saveDraft({
        garmentId: st.garmentId, variantId: st.variantId, side: st.side, method: st.method, quantities: st.quantities, layers: st.layers,
      }, initial ? draftScope : undefined);
      // Говорим один раз, когда сохранение перестало получаться, а не после каждой правки.
      if (r === lastSave.current) return;
      lastSave.current = r;
      if (r === 'no-images') setHint('Картинка не сохранится в этом браузере: после обновления страницы загрузи её заново.');
      else if (r === 'failed') setHint('Дизайн не сохранится в этом браузере: после обновления страницы он пропадёт.');
    }, 800);
    return () => clearTimeout(t);
  }, [draftGate, st.garmentId, st.variantId, st.side, st.method, st.quantities, st.layers]);

  // Шрифты текстовых слоёв: грузим по мере появления, после загрузки пересчитываем габарит.
  const fontKey = st.layers.flatMap((l) => (l.kind === 'text'
    ? [`${l.fontFamily}|${l.bold}|${l.italic}|${l.text}`]
    : l.mask?.kind === 'text' ? [`${l.mask.fontFamily}|${l.mask.bold}|false|${l.mask.text}`] : [])).join('\n');
  useEffect(() => {
    for (const line of fontKey ? fontKey.split('\n') : []) {
      const [family, bold, italic, ...text] = line.split('|');
      ensureFont(family, bold === 'true', italic === 'true', text.join('|')).catch(() => {});
    }
  }, [fontKey]);
  useEffect(() => onFontLoaded(() => useConstructor.getState().bumpFonts()), []);

  const hex = variant?.hex ?? '#ffffff';
  const price = useMemo(() => {
    if (!variant || !garment) return null;
    // Габарит — только по сторонам модели: печать на рукаве у шоппера в цену не идёт.
    const bounds = designBounds(garment, st.layers);
    const variants = priceVariants(garment, st.quantities);
    return calcPrice({ method: st.method, bounds, variants, currentId: variant.productId });
    // fontTick: габарит текста зависит от загруженного шрифта.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant, garment, st.method, st.layers, st.quantities, st.fontTick]);

  // Место под фото из готового принта, в которое встанет следующий выбранный файл.
  const replaceId = useRef<string | null>(null);
  const pickPhotoFor = (id: string) => { replaceId.current = id; fileRef.current?.click(); };
  /** Новое слово для фото в буквах: окно под фото меняет пропорции вместе со словом. */
  const setMaskText = (id: string, text: string) => {
    const l = st.layers.find((x) => x.id === id);
    if (l?.kind !== 'image' || l.mask?.kind !== 'text') return;
    const mask = { ...l.mask, text };
    st.updateLayer(id, { mask, ...refitSlot(l, maskAspect(mask)) }, 'merge');
  };
  /**
   * Новое слово у «снимка в каждой букве»: буквы перестраиваются той же высоты и по той же середине,
   * вставленные снимки остаются на своих местах по порядку (обрезаются под новые буквы).
   */
  const setGroupWord = (group: string, word: string) => {
    const letters = st.layers.filter((l): l is ImageLayer => l.group === group && isLetterSlot(l));
    const first = letters[0];
    if (!first || first.mask?.kind !== 'text' || !garment) return;
    const font = { fontFamily: first.mask.fontFamily, bold: first.mask.bold };
    const aspect = areaAspect(garment, first);
    const old = letterBoxes(letters.map((l) => (l.mask as { text: string }).text).join(''), font);
    const next = letterBoxes(word, font);
    if (!old.length || !next.length) return;
    // Ширина зоны на одну «ширину слова» и габарит старого слова (в долях ширины зоны).
    const unit = first.width / old[0].w;
    const left = first.x - unit * old[0].x;
    const top = first.y * aspect - unit * old[0].y;
    const oldH = unit * Math.max(...old.map((b) => b.y + b.h));
    // Та же высота букв, но не шире зоны (длинное слово уменьшается) и внутри неё по горизонтали.
    const newUnit = Math.min(oldH / Math.max(...next.map((b) => b.y + b.h)), 0.96);
    const newLeft = Math.min(1 - newUnit, Math.max(0, left + unit / 2 - newUnit / 2));
    const fresh = letterSlots(word, font, newLeft, top, newUnit, aspect).map((l, i) => {
      const was = letters[i];
      if (!was || was.placeholder || !was.srcSize) return l;
      return { ...l, src: was.src, fileName: was.fileName, isVector: was.isVector, srcSize: was.srcSize, placeholder: false, ...refitSlot(was, l.slot!) };
    });
    st.replaceInGroup(group, letters.map((l) => l.id), fresh);
  };
  /** Форма обрезки своего фото; размер снимка берём из самой картинки — у старых слоёв его нет в данных. */
  const setShape = (id: string, shape: PhotoShape | null) => {
    const l = st.layers.find((x) => x.id === id);
    if (l?.kind !== 'image' || !garment) return;
    const img = new window.Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const cur = useConstructor.getState().layers.find((x) => x.id === id);
      if (cur?.kind !== 'image' || !img.naturalWidth || !img.naturalHeight) return;
      const src = { w: img.naturalWidth, h: img.naturalHeight };
      st.updateLayer(id, applyShape(cur, shape ? PHOTO_SHAPE[shape] : null, src, areaAspect(garment, cur)));
      track('image_shape', { shape: shape ?? 'none' });
    };
    img.src = l.src;
  };
  const pickFile = () => { replaceId.current = null; fileRef.current?.click(); };

  /** Выбранный файл: фото с iPhone (HEIC) сначала перерисовываем в JPEG, дальше всё как обычно. */
  const onFile = (f?: File) => {
    if (!f || !isHeic(f)) return loadFile(f);
    const err = validateFile(f);
    setFileError(err);
    if (err) { replaceId.current = null; return; }
    convertHeic(f).then(loadFile, (e: Error) => { replaceId.current = null; setFileError(e.message); });
  };

  const loadFile = (f?: File) => {
    const slotId = replaceId.current;
    replaceId.current = null;
    if (!f || !garment) return;
    const err = validateFile(f);
    setFileError(err);
    if (err) return;
    const url = URL.createObjectURL(f);
    const img = new window.Image();
    img.onload = () => {
      const isVector = f.type === 'image/svg+xml';
      const slot = st.layers.find((l) => l.id === slotId);
      if (slot?.kind === 'image' && slot.slot !== undefined) {
        // Фото встаёт в окно шаблона: обрезаем по центру под пропорции окна, положение и размер слоя не меняются.
        const [iw, ih] = [img.naturalWidth || 1000, img.naturalHeight || 1000];
        const crop = coverCrop(iw, ih, slot.slot);
        st.updateLayer(slot.id, {
          src: url, fileName: f.name, isVector, naturalWidth: crop.width, naturalHeight: crop.height, crop, placeholder: false,
          srcSize: { w: iw, h: ih },
        });
        track('image_upload', { w: iw, h: ih, type: f.type, kb: Math.round(f.size / 1024), slot: true });
        return;
      }
      // Пустые поля по краям в размер принта не идут — обрезаем их сразу.
      const crop = contentBox(img) ?? undefined;
      const nw = crop?.width ?? (img.naturalWidth || 1000);
      const nh = crop?.height ?? (img.naturalHeight || 1000);
      // Вписываем в зону печати: 80% ширины, но не выше 80% высоты зоны и не крупнее, чем позволяет
      // разрешение снимка (MIN_DPI) — чтобы сразу после загрузки не было предупреждения о качестве.
      // Совсем маленькую картинку всё же ставим заметной (четверть зоны): предупреждение тогда честное.
      const pa = printAreaFor(garment, st.side);
      const areaRatio = pa.height / pa.width; // в единицах кадра: высота/ширина зоны
      const frameRatio = FRAME.h / FRAME.w;
      const sharp = isVector ? Infinity : (nw / MIN_DPI) * 2.54 / pa.widthCm;
      const width = Math.min(0.8, START_MAX_CM / pa.widthCm, (0.8 * areaRatio * frameRatio * nw) / nh, Math.max(0.25, sharp));
      st.addImage({ src: url, fileName: f.name, isVector, naturalWidth: nw, naturalHeight: nh, crop, width });
      track('image_upload', { w: nw, h: nh, type: f.type, kb: Math.round(f.size / 1024), trimmed: !!crop });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setFileError('Не получилось открыть файл. Попробуй PNG или JPG.');
    };
    img.src = url;
  };

  const addText = () => { st.addText(isLight(hex) ? '#111111' : '#ffffff'); track('text_add'); };
  const selected = st.layers.find((l) => l.id === st.selectedLayerId);
  const cropTarget = st.layers.find((l) => l.id === cropId);
  const cropLayer = cropTarget?.kind === 'image' ? cropTarget : undefined;
  const cropShape = cropLayer?.mask?.kind === 'shape' ? PHOTO_SHAPE[cropLayer.mask.shape] : undefined;
  // Буквы и полосы: в окне кадрирования показываем, какая часть снимка в них попадёт.
  const cropMask = cropLayer?.mask && cropLayer.mask.kind !== 'shape' ? cropLayer.mask : undefined;
  const cropAspect = cropLayer ? (cropLayer.slot ?? cropLayer.naturalHeight / cropLayer.naturalWidth) : 1;
  const cropOverlay = useMemo(() => (cropMask ? maskOverlay(cropMask, cropAspect) ?? undefined : undefined), [cropMask, cropAspect]);

  // «Готово» из строки-сводки: снимаем выбор и показываем раздел целиком.
  const layersRef = useRef<HTMLElement>(null);
  const orderRef = useRef<HTMLElement>(null);
  const finishTo = (to: 'layers' | 'order') => {
    st.selectLayer(null);
    if (to === 'layers') setLayersOpen(true);
    requestAnimationFrame(() => (to === 'layers' ? layersRef : orderRef).current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
  };
  const sideLayerCount = st.layers.filter((l) => l.side === st.side).length;
  const methodName = METHOD_INFO[st.method].title.split(/\s+[—–-]\s+/)[0];

  // Скрытые слои дизайном не считаются: сторона только с ними — пустая.
  const shown = useMemo(() => visibleLayers(st.layers), [st.layers]);
  const hasDesign = shown.some((l) => sides.includes(l.side));

  // Шаги сверху: первый пройден, когда посетитель сам выбрал вещь или цвет (или уже нанёс принт).
  const firstPick = useRef<string | null>(null);
  const [picked, setPicked] = useState(false);
  useEffect(() => {
    if (!st.garmentId || !st.variantId) return;
    const key = `${st.garmentId}|${st.variantId}`;
    if (firstPick.current === null) firstPick.current = key;
    else if (firstPick.current !== key) setPicked(true);
  }, [st.garmentId, st.variantId]);
  // fontTick: габарит текста зависит от загруженного шрифта.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const blocked = useMemo(() => overflowingLayers({ garments: st.garments, garmentId: st.garmentId, layers: st.layers }).length > 0, [st.garments, st.garmentId, st.layers, st.fontTick]);
  const guideActive: GuideStep = hasDesign ? 3 : picked ? 2 : 1;
  const leftRef = useRef<HTMLElement>(null);
  const designRef = useRef<HTMLElement>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout>>();
  const flash = (el: HTMLElement | null) => {
    if (!el) return;
    clearTimeout(flashTimer.current);
    appRef.current?.querySelectorAll<HTMLElement>('[data-flash]').forEach((x) => { delete x.dataset.flash; });
    void el.offsetWidth; // перезапуск подсветки при повторном нажатии
    el.dataset.flash = '';
    flashTimer.current = setTimeout(() => { delete el.dataset.flash; }, 1400);
  };
  const showStep = (n: GuideStep) => {
    if (n === 1) { leftRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); return flash(leftRef.current); }
    st.selectLayer(null);
    const el = n === 2 ? designRef : orderRef;
    if (n === 3) setTab('order');
    requestAnimationFrame(() => { el.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }); flash(el.current); });
  };
  /** Можно ли отдавать макет дальше; если нет — ведёт к тому, что мешает. */
  const ready = (): boolean => {
    if (!hasDesign) { setTab('design'); return false; }
    // В готовом принте осталось пустое место под фото — в печать оно уйти не должно.
    const empty = shown.find((l) => l.kind === 'image' && l.placeholder && sides.includes(l.side));
    if (empty) {
      st.setSide(empty.side);
      st.selectLayer(empty.id);
      setHint('Вставь своё фото в рамку или удали её.');
      return false;
    }
    // Принт выходит за зону печати — за границей он не напечатается: ведём к первому такому слою.
    const out = overflowingLayers({ garments: st.garments, garmentId: st.garmentId, layers: st.layers });
    if (out.length) {
      st.setSide(out[0].side);
      st.selectLayer(out[0].id);
      setHint('Часть принта за границей зоны печати. Сдвинь или уменьши — или нажми «Вписать в зону».');
      return false;
    }
    if (!price?.qty) { setTab('order'); finishTo('order'); return false; }
    return true;
  };
  const [adding, setAdding] = useState(false);
  const addToCart = async () => {
    if (adding || !ready() || !garment || !price || !stageRef.current) return;
    setAdding(true);
    try {
      const design = await captureDesign(stageRef, garment, price);
      track('cart_add', { product: garment.name, method: st.method, qty: price.qty, order_price: price.total, colors: price.lines.length });
      onAddToCart(design);
      // Работа режима ушла в корзину — её черновик больше не нужен.
      sent.current = { layers: st.layers, quantities: st.quantities };
      if (initial && draftScope) clearDraft(draftScope);
    } catch (e) {
      console.error('[constructor] add to cart failed', e);
      setHint('Не получилось сохранить принт. Попробуй ещё раз.');
    } finally {
      setAdding(false);
    }
  };

  // Телефон: шагов сверху нет — вперёд ведёт кнопка итога внизу, назад — эта строка в начале листа.
  const backRow = narrow && tab !== 'garment' && !selected && !st.selectedGroup && (
    <button type="button" className={s.back} onClick={() => setTab(tab === 'order' ? 'design' : 'garment')}>
      <Icon name="chevronLeft" size={18} />
      {tab === 'order' ? 'Принт' : 'Изделие'}
      {tab === 'design' && garment && <span className={s.backMeta}>{garment.name}{variant ? ` · ${variant.colorName}` : ''}</span>}
    </button>
  );

  return (
    <div
      ref={appRef} className={s.app} data-tab={tab} data-editing={selected || st.selectedGroup ? '' : undefined} data-kb={kb ? '' : undefined}
      data-sheet={sheetFull ? 'full' : undefined}
    >
      <StepGuide active={guideActive} done={(n) => (n === 1 ? picked || hasDesign : n === 2 && hasDesign)} onStep={showStep} />

      {/* Изделие */}
      <section ref={leftRef} className={`${s.panel} ${s.left}`} data-section="garment">
        <h3 className={s.h}><span className={s.hNum} aria-hidden>1</span>Изделие</h3>
        {error && <p className={s.err}>{error}</p>}
        {!st.garments.length && !error && <p className={s.muted}>Загружаем каталог…</p>}
        <GarmentPicker
          garments={st.garments} garmentId={st.garmentId} variant={variant}
          onSelect={st.selectGarment} linked={linked}
        />
      </section>

      {/* Холст */}
      <main className={s.center}>
        <div className={s.sides}>
          {sides.map((side) => (
            <button
              key={side}
              className={side === st.side ? s.tabActive : s.tab}
              title={SIDE_LABEL[side]}
              onClick={() => { st.setSide(side); track('side_switch', { side }); }}
            >
              {SIDE_TAB[side]}
              {sideHasLayers(st.layers, side) && <i className={s.dot} />}
            </button>
          ))}
        </div>
        <div
          className={dragOver ? s.stageDrop : s.stage}
          onDragOver={(e) => { if (e.dataTransfer.types.includes('Files')) { e.preventDefault(); setDragOver(true); } }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget as Node)) setDragOver(false); }}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); onFile(e.dataTransfer.files?.[0]); }}
        >
          <DesignStage
            apiRef={stageRef}
            empty={{ onUpload: pickFile, dragging: dragOver }}
            zoom={zoom}
            onZoom={setZoom}
            focus={narrow && !!st.selectedLayerId}
            onCrop={setCropId}
          />
          {dragOver && <div className={s.dropHint}>Отпусти файл, чтобы добавить</div>}
          {/* Фото выбранной модели из каталога — в углу поля, где обычно пусто */}
          {garment && photosOf(garment).length > 0 && !(narrow && st.selectedLayerId) && (
            <button ref={photosBtn} type="button" className={s.livePhotos} onClick={() => setPhotosOpen(true)} aria-label={`Фото вживую: ${garment.name}`}>
              <Icon name="image" size={18} />
              <span>Фото вживую</span>
            </button>
          )}
        </div>
        {/* Панель под холстом: история слева, цвет по центру, масштаб справа — ничего не лежит поверх графики. */}
        <div className={s.toolbar}>
          <div className={s.history} role="group" aria-label="История">
            <button type="button" onClick={st.undo} disabled={!undoable} aria-label="Отменить" title="Отменить (Ctrl+Z)"><HistoryIcon /></button>
            <button type="button" onClick={st.redo} disabled={!redoable} aria-label="Повторить" title="Повторить (Ctrl+Shift+Z)"><HistoryIcon redo /></button>
          </div>
          {garment && garment.variants.length > 0 && (
            <div className={s.colorBar} role="radiogroup" aria-label="Цвет изделия">
              <div className={s.colors}>
                {garment.variants.map((v) => {
                  const n = variantQty(st.quantities, v);
                  return (
                  <button
                    key={v.productId}
                    role="radio"
                    aria-checked={v.productId === st.variantId}
                    className={v.productId === st.variantId ? s.swatchActive : s.swatch}
                    style={{ background: v.hex }}
                    title={n ? `${v.colorName} — ${n} шт в заявке` : v.colorName}
                    aria-label={n ? `${v.colorName}, ${n} шт` : v.colorName}
                    onClick={() => { st.selectVariant(v.productId); track('color_select', { color: v.colorName }); }}
                  >
                    {n > 0 && <span className={s.swatchCount} aria-hidden>{n > 99 ? '99+' : n}</span>}
                  </button>
                  );
                })}
              </div>
            </div>
          )}
          <div className={s.zoom} role="group" aria-label="Масштаб">
            <button type="button" onClick={() => setZoom((z) => Math.max(1, z / ZOOM_STEP))} disabled={zoom <= 1} aria-label="Уменьшить" title="Уменьшить">−</button>
            <button type="button" className={s.zoomValue} onClick={() => setZoom(1)} disabled={zoom === 1} aria-label="Сбросить масштаб" title="Сбросить масштаб">{Math.round(zoom * 100)}%</button>
            <button type="button" onClick={() => setZoom((z) => Math.min(MAX_USER_ZOOM, z * ZOOM_STEP))} disabled={zoom >= MAX_USER_ZOOM} aria-label="Увеличить" title="Увеличить">+</button>
          </div>
        </div>
      </main>

      {/* Ручка листа — только на телефоне: нажатие или свайп меняет высоту панели */}
      <button
        type="button" className={s.grip} data-still="" aria-label={sheetFull ? 'Свернуть панель' : 'Развернуть панель'}
        aria-expanded={sheetFull}
        onPointerDown={(e) => { gripY.current = e.clientY; e.currentTarget.setPointerCapture?.(e.pointerId); }}
        onPointerUp={(e) => {
          const dy = gripY.current === null ? 0 : e.clientY - gripY.current;
          gripY.current = null;
          setSheetFull((v) => (dy <= -GRIP_SWIPE ? true : dy >= GRIP_SWIPE ? false : !v));
        }}
        onPointerCancel={() => { gripY.current = null; }}
        // Клавиатура и программный click: без жеста — просто переключить.
        onClick={(e) => { if (e.detail === 0) setSheetFull((v) => !v); }}
      />

      <aside className={`${s.panel} ${s.right}`} data-editing={selected || st.selectedGroup ? '' : undefined}>
        {/* Дизайн: содержимое зависит от выбранного слоя */}
        <section ref={designRef} className={s.section} data-section="design">
          {backRow}
          <DesignPanel
            stage={stageRef} fileError={fileError} onUpload={pickFile} onAddText={addText}
            onTemplates={() => setTemplatesOpen(true)} onReplacePhoto={pickPhotoFor} onMaskText={setMaskText}
            onCrop={setCropId} onShape={setShape} onGroupWord={setGroupWord}
          />
          {/* Телефон: слои — не отдельная вкладка, а короткий список под кнопками добавления */}
          {narrow && !selected && !st.selectedGroup && <LayersPanel embedded hex={hex} open onToggle={() => {}} />}
          <input
            ref={fileRef} type="file" hidden accept={ACCEPT_ATTR}
            onChange={(e) => { onFile(e.target.files?.[0]); e.target.value = ''; }}
          />
        </section>

        {/* Слои */}
        <section ref={layersRef} className={s.section} data-section="layers" data-collapsed={layersOpen ? undefined : ''}>
          <div className={s.summary}>
            <SumRow title="Слои" meta={sideLayerCount ? `${sideLayerCount} на стороне` : 'пусто'} onClick={() => finishTo('layers')} />
          </div>
          <div className={s.full}>
            <LayersPanel hex={hex} open={layersOpen} onToggle={() => setLayersOpen((v) => !v)} />
          </div>
        </section>

        {/* Размеры */}
        <section ref={orderRef} className={s.section} data-section="order">
          {backRow}
          <div className={s.summary}>
            <SumRow title="Нанесение" meta={methodName} onClick={() => finishTo('order')} />
            <SumRow title="Размеры" meta={price?.qty ? `${price.qty} шт` : 'не выбраны'} onClick={() => finishTo('order')} />
          </div>
          <div className={s.full}>
            <OrderPanel variant={variant} price={price} onSizeChart={() => setChartOpen(true)} />
          </div>
        </section>

        {/* Итог — на мобильном закреплён внизу */}
        <OrderFooter
          price={price} hasDesign={hasDesign} blocked={blocked}
          onAddToCart={addToCart} adding={adding} addLabel={addLabel}
        />
      </aside>

      {children}
      {draftGate === 'ask' && draft && (
        <DraftPrompt
          draft={draft}
          onNew={() => { clearDraft(); setDraft(null); openLinked(); setDraftGate('open'); }}
          onContinue={() => restoreImages(draft).then(openDraft)}
        />
      )}
      {hint && <div className={s.notice} role="status">{hint}</div>}
      {templatesOpen && <TemplatePicker hex={hex} onClose={() => setTemplatesOpen(false)} />}
      {photosOpen && garment && (
        <ModelInfo garment={garment} onClose={() => { setPhotosOpen(false); requestAnimationFrame(() => photosBtn.current?.focus()); }} />
      )}
      {cropLayer && garment && (
        <CropEditor
          src={cropLayer.src} flipX={cropLayer.flipX} flipY={cropLayer.flipY} crop={cropLayer.crop} lockedAspect={cropLayer.slot ?? cropShape?.aspect} shape={cropShape} overlay={cropOverlay}
          onClose={() => setCropId(null)}
          onApply={(crop, src) => {
            st.updateLayer(cropLayer.id, applyCrop(cropLayer, crop, src, areaAspect(garment, cropLayer)));
            track('image_crop', { slot: cropLayer.slot !== undefined });
            setCropId(null);
          }}
        />
      )}
      {chartOpen && <SizeChart sizes={variant?.sizes ?? []} onClose={() => setChartOpen(false)} />}
    </div>
  );
}

/** Фокус в поле конструктора, которое открывает экранную клавиатуру: ползунок, галочка, выбор цвета и файла её не открывают. */
function typingIn(app: HTMLElement | null) {
  const field = document.activeElement;
  return !!field && !!app?.contains(field)
    && field.matches('textarea, input:not([type=range], [type=checkbox], [type=radio], [type=color], [type=file])');
}
