import { colorName } from '@/app/utils/product-colors';
import { IProduct, ITag } from '@/app/utils/types';
import { colorHex, colorVariants, priceWithPrint, productBadges, productMainPhotoUrl, secondPhotoUrl, sizesInStock } from '../data';
import ProductCardView, { type CardVariant } from './product-card-view';

/**
 * Карточка товара в каталоге и в «Похожих». Здесь, на сервере, из всего каталога собираются только цвета этого товара —
 * в браузер уходят они, а не весь каталог. Переключение цвета — в ProductCardView.
 */
const ProductCard: React.FC<{
  product: IProduct;
  /** Весь каталог: из него берутся другие цвета товара */
  all: IProduct[];
  tags: ITag[];
  titleAs?: 'h2' | 'h3';
  /** Первые карточки экрана грузят фото сразу */
  priority?: boolean;
}> = ({ product, all, tags, titleAs, priority = false }) => {
  const products = colorVariants(product, all);
  const variants: CardVariant[] = (products.length > 0 ? products : [product]).map((item) => ({
    id: item._id,
    slug: item.slug,
    name: item.name,
    color: colorName(item.color),
    hex: colorHex(item),
    photo: productMainPhotoUrl(item),
    second: secondPhotoUrl(item),
    price: item.price,
    withPrint: priceWithPrint(item),
    sizes: sizesInStock(item),
    badges: productBadges(item, tags),
    printable: Boolean(item.isForPrinting),
  }));
  return (
    <ProductCardView
      variants={variants}
      initial={Math.max(0, variants.findIndex((variant) => variant.id === product._id))}
      titleAs={titleAs}
      priority={priority}
    />
  );
};

export default ProductCard;
