import methodsData from '@/app/utils/print-methods-data';

/** Цвет свёрнутой панели: салатовых и синих поровну (решение владельца 22.11) */
export type MethodTone = 'lime' | 'blue' | 'ink';

export type MethodPanelData = {
  slug: string;
  name: string;
  tone: MethodTone;
  /** Длинное название — меньшим кеглем, чтобы влезло в раскрытую панель */
  longName?: boolean;
  /** Для чего метод лучше всего — одна строка */
  best: string;
  minRun: string;
  facts: string[];
  /** Ограничения метода — показываются контуром, а не заливкой */
  limits: string[];
  image: (typeof methodsData)[number]['images']['main'];
};

// Факты — из pros/cons страниц методов (method-options-data) и текстов страниц методов (print-methods-data).
const panelSettings: Record<string, Omit<MethodPanelData, 'slug' | 'image'>> = {
  'pryamaya-dtg-pechat': {
    name: 'DTG',
    tone: 'lime',
    best: 'Фото и сложные рисунки поштучно',
    minRun: 'от 1 шт.',
    facts: ['Полноцветная печать', 'Супербыстрая печать'],
    limits: ['Сложнее на цветной ткани', 'Бережная стирка'],
  },
  'dtf-pechat': {
    name: 'DTF',
    tone: 'blue',
    best: 'Яркий полноцвет на любой ткани',
    minRun: 'от 1 шт.',
    facts: ['Любой материал', 'Полноцветная печать'],
    limits: ['Срок 1–2 дня', 'Бережная стирка'],
  },
  shelkografiya: {
    name: 'Шелкография',
    tone: 'ink',
    longName: true,
    best: 'Одежда для команд и форма большими тиражами',
    minRun: 'от 50 шт.',
    facts: ['Долговечно', 'Низкая стоимость', 'Цвета по Пантону', 'Яркий белый'],
    limits: ['Срок от 3 недель'],
  },
  'termotransfernaya-pechat': {
    name: 'Термотрансфер',
    tone: 'lime',
    longName: true,
    best: 'Срочные надписи и спецэффекты',
    minRun: 'от 20 шт.',
    facts: ['От 15 минут', 'Любой материал', 'Золото, медь, кислотные цвета'],
    limits: ['Только вектор в один цвет'],
  },
  vishivka: {
    name: 'Вышивка',
    tone: 'blue',
    best: 'Логотипы на худи, поло и кепках',
    minRun: 'от 20 шт.',
    facts: ['Многоцветные логотипы', 'Шевроны', 'Простые — за несколько часов'],
    limits: [],
  },
};

export const methodPanels = Object.keys(panelSettings).flatMap((slug): MethodPanelData[] => {
  const method = methodsData.find((item) => item.slug === slug);
  return method ? [{ slug, ...panelSettings[slug], image: method.images.main }] : [];
});

export const methodsTitle = (count: number) => {
  const rest = count % 10;
  const word = count % 100 >= 11 && count % 100 <= 14 ? 'способов' : rest === 1 ? 'способ' : rest >= 2 && rest <= 4 ? 'способа' : 'способов';
  return `${count} ${word} печати`;
};
