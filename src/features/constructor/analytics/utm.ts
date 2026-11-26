/**
 * UTM-метки запоминаются при первом заходе с метками и живут до конца сессии:
 * клиент может прийти на сайт по рекламе, а в конструктор перейти уже без параметров в адресе.
 */
const KEYS = ['source', 'medium', 'campaign', 'content', 'term'] as const;
/** Тот же ключ, что у остальных страниц сайта, — метки, сохранённые там, видны и здесь. */
const STORAGE_KEY = 'pinhead_utm';

export type Utm = Partial<Record<(typeof KEYS)[number], string>>;

/** Читает сохранённые метки; если в адресе есть новые — запоминает их вместо старых. */
export function getUtm(): Utm {
  if (typeof window === 'undefined') return {};
  let utm: Utm = {};
  try {
    utm = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '{}') as Utm;
  } catch {
    // хранилище недоступно или в нём мусор — работаем без него
  }
  const q = new URLSearchParams(window.location.search);
  if (KEYS.some((k) => q.get(`utm_${k}`))) {
    utm = {};
    for (const k of KEYS) {
      const v = q.get(`utm_${k}`);
      if (v) utm[k] = v.slice(0, 200);
    }
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(utm));
    } catch {
      // приватный режим — метки останутся только на эту загрузку страницы
    }
  }
  return utm;
}
