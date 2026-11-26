/** Фото готовых принтов «вживую»: реальные вещи с таким принтом. */
export interface TemplatePhoto {
  /** Путь от корня сайта, файл лежит в public/. */
  src: string;
  alt: string;
  width: number;
  height: number;
}

/**
 * id шаблона → фото. Пока список пуст или шаблона нет в карте, карточка показывает одно превью принта;
 * с первым фото появляется карусель: превью принта, дальше фото.
 * Пример: 'polaroid': [{ src: '/template-photos/polaroid-1.jpg', alt: 'Худи со снимком и подписью', width: 960, height: 1152 }],
 */
export const TEMPLATE_PHOTOS: Record<string, TemplatePhoto[]> = {};
