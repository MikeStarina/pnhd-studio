import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ConstructorWithCart } from './ConstructorWithCart';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Конструктор одежды с принтом онлайн — ПИНХЭД СТУДИЯ',
  description:
    'Нанеси свой принт онлайн: выбери футболку, худи, свитшот или шоппер, загрузи картинку или добавь текст, сразу увидишь цену и положи в корзину.',
  metadataBase: new URL('https://studio.pnhd.ru'),
  alternates: { canonical: '/constructor' },
  openGraph: {
    type: 'website',
    title: 'Конструктор одежды с принтом — ПИНХЭД СТУДИЯ',
    images: '/opengraph-image.jpg',
  },
};

export default function ConstructorPage() {
  return (
    <div className={styles.page} data-layout="wide">
      <h1 className={styles.title}>Конструктор одежды с принтом</h1>
      {/* useSearchParams внутри: без границы Suspense страница не соберётся статически */}
      <Suspense>
        <ConstructorWithCart />
      </Suspense>
    </div>
  );
}
