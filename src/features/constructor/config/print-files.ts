/**
 * Файлы для печати, которые клиент прикладывает к заявке сам: макеты в PDF, AI, PSD и т. п.
 * Одни правила для формы (что выбрать) и для сервера (что принять). Сервер дополнительно проверяет содержимое.
 */
export const PRINT_FILES = {
  /** Расширения, которые принимаем. */
  ext: ['pdf', 'ai', 'eps', 'ps', 'psd', 'psb', 'cdr', 'tif', 'tiff', 'png', 'jpg', 'jpeg', 'webp', 'svg', 'zip', 'rar'],
  maxCount: 10,
  /** Предел одного файла: больше Битрикс через вебхук не принимает надёжно, а бот Telegram — вовсе. */
  maxMb: 50,
} as const;

export const PRINT_FILES_ACCEPT = PRINT_FILES.ext.map((x) => `.${x}`).join(',');

export const fileExt = (name: string) => name.match(/\.([^.]+)$/)?.[1].toLowerCase() ?? '';

/** Почему файл не подходит — текст для клиента; пустая строка — подходит. */
export function printFileProblem(file: File): string {
  if (!(PRINT_FILES.ext as readonly string[]).includes(fileExt(file.name))) return `${file.name}: такой формат не принимаем`;
  if (file.size === 0) return `${file.name}: пустой файл`;
  if (file.size > PRINT_FILES.maxMb * 1024 * 1024) return `${file.name}: больше ${PRINT_FILES.maxMb} МБ — пришли его менеджеру ссылкой`;
  return '';
}
