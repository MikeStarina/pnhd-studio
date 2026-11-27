import Image from 'next/image';
import Link from 'next/link';
import { getShopData } from '@/app/utils/constants';
import { Icon } from '@/features/constructor/ui/icons';
import { IProduct } from '@/app/utils/types';
import { modelsWord, rub, sortForShop } from '@/components/catalog/data';
import Section from '../section/section';
import SectionHead from '../section-head/section-head';
import MoreLink from '../more-link/more-link';
import styles from './catalog-preview.module.css';

/** Плитки по порядку: футболки — крупная слева, остальные — сетка 2×2 справа. Фото — вырезки из макета, число моделей и цена — из каталога */
const categories = [
  { type: 'tshirt', label: 'Футболки', href: '/futbolki', photo: '/home/catalog/tshirt.png', look: styles.tshirt },
  { type: 'hoodie', label: 'Худи', href: '/hudi', photo: '/home/catalog/hoodie-cutout.png', look: '' },
  { type: 'longsleeve', label: 'Лонгсливы', href: '/longslivy', photo: '/home/catalog/longsleeve-cutout.png', look: styles.longsleeve },
  { type: 'sweatshirt', label: 'Свитшоты', href: '/svitshoty', photo: '/home/catalog/sweatshirt-cutout.png', look: '' },
  { type: 'totebag', label: 'Шопперы', href: '/shoppery', photo: '/home/catalog/shopper-cutout.png', look: '' },
] as const;

const CatalogPreview: React.FC = async () => {
  const products: IProduct[] = (await getShopData()) ?? [];
  const sorted = sortForShop(products);

  const tiles = categories
    .map((category) => ({ ...category, products: sorted.filter((product) => product.type === category.type) }))
    .filter((tile) => tile.products.length > 0);

  return (
    <Section tone="white" id="catalog" labelledBy="catalog-title">
      <div className={styles.fit}>
        <SectionHead
          titleId="catalog-title"
          title={<>Выбери вещь для принта</>}
          action={
            tiles.length > 0 && (
              <MoreLink href="/shop" size="l">
                Весь каталог
              </MoreLink>
            )
          }
        />

        {tiles.length > 0 ? (
          <ul className={styles.bento} data-reveal-group="fan">
            {tiles.map((tile) => (
              <li key={tile.type} className={`${styles.tile} ${tile.type === 'tshirt' ? styles.big : ''}`}>
                <Link href={tile.href} className={styles.link}>
                  <span className={`${styles.photo} ${tile.look}`}>
                    {tile.type === 'tshirt' && (
                      <Image src="/home/catalog/star-burst.svg" alt="" width={814} height={783} className={styles.star} />
                    )}
                    <span className={styles.frame}>
                      <Image
                        src={tile.photo}
                        alt=""
                        fill
                        sizes={tile.type === 'tshirt' ? '(max-width: 1023px) 100vw, 45vw' : '(max-width: 1023px) 50vw, 23vw'}
                        className={styles.img}
                      />
                    </span>
                    <span className={styles.models}>
                      {tile.products.length}&nbsp;{modelsWord(tile.products.length)}
                      <span className={styles.dot}>
                        <Icon name="arrowRight" size={14} stroke={2} />
                      </span>
                    </span>
                  </span>
                  <span className={styles.row}>
                    <span className={styles.name}>{tile.label}</span>
                    <span className={styles.price}>
                      от&nbsp;{rub(Math.min(...tile.products.map((product) => product.price)))}
                    </span>
                  </span>
                </Link>
              </li>
            ))}
            <li className={styles.all}>
              <Link href="/shop" className={styles.allLink}>
                <span className={styles.allName}>Весь каталог</span>
                <span className={styles.arrow}>
                  <Icon name="arrowRight" size={24} stroke={2} />
                </span>
              </Link>
            </li>
          </ul>
        ) : (
          <p className={styles.empty}>
            Каталог сейчас не загрузился. Открой <Link href="/shop">полный каталог</Link> или обнови страницу чуть позже.
          </p>
        )}
      </div>
    </Section>
  );
};

export default CatalogPreview;
