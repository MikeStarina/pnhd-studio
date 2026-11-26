/** Пунктов в сантиметре: размер страницы PDF задаётся в пунктах (1/72 дюйма). */
const PT_PER_CM = 72 / 2.54;

/**
 * Файл печати в PDF: одна страница в размер принта, внутри PNG в полном разрешении с прозрачностью.
 * Такой PDF открывают Illustrator, CorelDRAW и РИП печатной машины — менеджеру не нужно пересчитывать размер.
 * Высота — по пропорциям самого PNG: картинка в PDF не растягивается.
 */
export async function printPdf(png: File, wCm: number, name: string): Promise<File> {
  const { PDFDocument } = await import('pdf-lib');
  const doc = await PDFDocument.create();
  const image = await doc.embedPng(new Uint8Array(await png.arrayBuffer()));
  const width = wCm * PT_PER_CM;
  const height = (width * image.height) / image.width;
  doc.addPage([width, height]).drawImage(image, { x: 0, y: 0, width, height });
  return new File([Buffer.from(await doc.save())], name, { type: 'application/pdf' });
}
