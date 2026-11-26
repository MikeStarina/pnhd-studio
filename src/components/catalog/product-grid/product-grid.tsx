import { IProduct, ITag } from '@/app/utils/types';
import ProductCard from '../product-card/product-card';
import styles from './product-grid.module.css';

/** Сетка карточек: 4 колонки на компьютере, 3 на узком, 2 на планшете и телефоне */
const ProductGrid: React.FC<{
  products: IProduct[];
  all: IProduct[];
  tags: ITag[];
  titleAs?: 'h2' | 'h3';
  label?: string;
  /** Сетка на первом экране: первые фото грузятся сразу */
  priority?: boolean;
}> = ({ products, all, tags, titleAs, label, priority = false }) => (
  <ul className={styles.grid} aria-label={label} data-reveal-group>
    {products.map((product, index) => (
      <li key={product._id}>
        <ProductCard product={product} all={all} tags={tags} titleAs={titleAs} priority={priority && index < 4} />
      </li>
    ))}
  </ul>
);

export default ProductGrid;
