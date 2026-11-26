import Image from 'next/image';
import Link from 'next/link';
import { getShopData } from '@/app/utils/constants';
import { productMainPhotoUrl } from '@/app/utils/product-photos';
import { Icon } from '@/features/constructor/ui/icons';
import { IProduct } from '@/app/utils/types';
import { modelsWord, rub, sortForShop } from '@/components/catalog/data';
import Section from '../section/section';
import SectionHead from '../section-head/section-head';
import styles from './catalog-preview.module.css';

/** Плитки бенто по порядку: размер задаёт место в сетке (высокая — первая колонка, широкая — две колонки) */
const categories = [
  { type: 'tshirt', label: 'Футболки', href: '/futbolki', size: 'tall' },
  { type: 'hoodie', label: 'Худи', href: '/hudi', size: 'wide' },
  { type: 'longsleeve', label: 'Лонгсливы', href: '/longslivy', size: 'small' },
  { type: 'sweatshirt', label: 'Свитшоты', href: '/svitshoty', size: 'small' },
  { type: 'totebag', label: 'Шопперы', href: '/shoppery', size: 'small' },
] as const;

const sizeClass = { tall: styles.tall, wide: styles.wide, small: '' };

/**
 * Снимки на модели в каталоге — JPG, вырезанные вещи — обычно PNG. У новых товаров первое фото — вырезка,
 * а снимки на модели идут дальше в галерее, поэтому ищем первый JPG по всей галерее в порядке каталога.
 * Товары без `photos` (шопперы) отдают старый главный снимок — он тоже на модели.
 */
const tilePhoto = (products: IProduct[]) =>
  products.flatMap((product) => product.photos ?? []).find((url) => /\.jpe?g$/i.test(url)) ??
  productMainPhotoUrl(products[0]);

const CatalogPreview: React.FC = async () => {
  const products: IProduct[] = (await getShopData()) ?? [];
  const sorted = sortForShop(products);

  const tiles = categories
    .map((category) => ({ ...category, products: sorted.filter((product) => product.type === category.type) }))
    .filter((tile) => tile.products.length > 0);

  return (
    <Section tone="white" id="catalog" labelledBy="catalog-title">
      <SectionHead
        titleId="catalog-title"
        title={<>Или выбери готовое</>}
        lead={
          sorted.length > 0
            ? `${sorted.length} ${modelsWord(sorted.length)} одежды и аксессуаров — на любую нанесём твой принт`
            : undefined
        }
      />

      {tiles.length > 0 ? (
        <ul className={styles.bento} data-reveal-group="fan">
          {tiles.map((tile) => (
            <li key={tile.type} className={`${styles.tile} ${sizeClass[tile.size]}`}>
              <Link href={tile.href} className={styles.link}>
                <Image
                  src={tilePhoto(tile.products)}
                  alt=""
                  fill
                  sizes={tile.size === 'small' ? '(max-width: 1023px) 50vw, 25vw' : '(max-width: 1023px) 100vw, 50vw'}
                  className={styles.img}
                />
                <span className={styles.foot}>
                  <span className={styles.label}>
                    <span className={styles.name}>{tile.label}</span>
                    <span className={styles.meta}>
                      <span>
                        {tile.products.length}&nbsp;{modelsWord(tile.products.length)}
                      </span>
                      <span>от&nbsp;{rub(Math.min(...tile.products.map((product) => product.price)))}</span>
                    </span>
                  </span>
                  <span className={styles.arrow}>
                    <Icon name="arrowRight" size={24} stroke={2} />
                  </span>
                </span>
              </Link>
            </li>
          ))}
          <li className={`${styles.tile} ${styles.all}`}>
            <Link href="/shop" className={styles.link}>
              <span className={styles.foot}>
                <span className={styles.label}>
                  <span className={styles.name}>Весь каталог</span>
                  <span className={styles.meta}>
                    {sorted.length}&nbsp;{modelsWord(sorted.length)}
                  </span>
                </span>
                <span className={styles.arrow}>
                  <Icon name="arrowRight" size={24} stroke={2} />
                </span>
              </span>
            </Link>
          </li>
        </ul>
      ) : (
        <p className={styles.empty}>
          Каталог сейчас не загрузился. Открой <Link href="/shop">полный каталог</Link> или обнови страницу чуть позже.
        </p>
      )}
    </Section>
  );
};

export default CatalogPreview;
