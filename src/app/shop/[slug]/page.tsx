import React from 'react';
import Link from 'next/link';
import { colorName } from '@/app/utils/product-colors';
import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import { fetchProducts, getShopData, getCategoriesData } from '@/app/utils/constants';
import { IProduct } from '@/app/utils/types';
import { toCategoryArray } from '@/app/utils/product-categories';
import { absoluteMediaUrl, productGallerySources, productMainPhotoUrl } from '@/app/utils/product-photos';
import { SITE_INFO } from '@/app/constants';
import MarkupScript from '@/components/shared-components/markup-script/markup-script';
import Breadcrumbs from '@/components/shared-components/breadcrumbs/Breadcrumbs';
import {
  CATALOG_CATEGORIES,
  colorHex,
  colorVariants,
  getTags,
  inStock,
  productBadges,
  rub,
  sortForShop,
  toCardProduct,
} from '@/components/catalog/data';
import ProductGallery from '@/components/catalog/product-gallery/product-gallery';
import ProductPurchase from '@/components/catalog/product-purchase/product-purchase';
import ProductTrust from '@/components/catalog/product-trust/product-trust';
import RecentlyViewed from '@/components/catalog/recently-viewed/recently-viewed';
import { sizeChartFor } from '@/components/catalog/size-charts';
import { getYandexReviews } from '@/components/home/reviews/yandex-reviews';
import ProductGrid from '@/components/catalog/product-grid/product-grid';
import Section from '@/components/home/section/section';
import SectionHead from '@/components/home/section-head/section-head';
import SheetCut from '@/components/home/sheet-cut/sheet-cut';
import MoreLink from '@/components/home/more-link/more-link';
import styles from './page.module.css';

type TProps = { params: { slug: string } };

const SIMILAR_COUNT = 4;

export const generateStaticParams = async () => {
  const data = await getShopData();
  return (data ?? []).filter((item: IProduct) => item.slug).map((item: IProduct) => ({ slug: item.slug }));
};

export async function generateMetadata({ params }: TProps): Promise<Metadata> {
  const [item] = await fetchProducts({ slug: params.slug });
  if (!item) return { title: 'Товар не найден | PINHEAD STUDIO', robots: { index: false } };
  const categories = await getCategoriesData().catch(() => []);
  const categoryLabels = toCategoryArray(item.category).map((id) => categories.find((c) => c._id === id)?.label ?? id);
  const url = `${SITE_INFO.domain}/shop/${params.slug}`;

  return {
    title: `${item.name} | PINHEAD STUDIO`,
    description: `${item.name} - ${item.description}`,
    keywords: [...categoryLabels, item.type, item.color],
    openGraph: {
      images: productMainPhotoUrl(item),
      type: 'website',
      url,
      description: item.description,
      siteName: 'PINHEAD STUDIO',
      title: item.name,
    },
    alternates: { canonical: url },
  };
}

const ProductPage: React.FC<TProps> = async ({ params }) => {
  // Сбой API — ошибка, а не 404: при пересборке Next оставит прежнюю страницу, а не закэширует «не найдено»
  const [item] = await fetchProducts({ slug: params.slug });
  if (!item) notFound();

  const [allProducts, tags, { rating }] = await Promise.all([
    getShopData() as Promise<IProduct[]>,
    getTags(),
    getYandexReviews(),
  ]);
  const all = sortForShop(allProducts ?? []);
  const variants = colorVariants(item, all);
  const category = CATALOG_CATEGORIES.find((entry) => entry.type === item.type);
  const url = `${SITE_INFO.domain}/shop/${item.slug}`;

  // Только тот же раздел: худи к худи. Сначала другие модели, потом другие цвета этой же; чужие разделы не добираем
  const variantIds = new Set(variants.map((variant) => variant._id));
  const sameType = all.filter((product) => product.type === item.type && product._id !== item._id);
  const similar = [
    ...sameType.filter((product) => !variantIds.has(product._id)),
    ...sameType.filter((product) => variantIds.has(product._id)),
  ].slice(0, SIMILAR_COUNT);

  const photos = productGallerySources(item).map((photo) => ({ cdn: photo.cdnPhoto, api: photo.apiPhoto }));
  const images = item.photos?.length
    ? item.photos
    : [productMainPhotoUrl(item), ...(item.galleryPhotos ?? []).map(absoluteMediaUrl)];

  const crumbs = [
    { label: 'Главная', href: '/' },
    { label: 'Каталог', href: '/shop' },
    ...(category ? [{ label: category.label, href: category.href }] : []),
    { label: item.name, href: `/shop/${item.slug}` },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: item.name,
    description: item.description,
    image: Array.from(new Set(images.filter(Boolean))),
    sku: item.oneCCode || item._id,
    brand: { '@type': 'Brand', name: 'PINHEAD STUDIO' },
    offers: {
      '@type': 'Offer',
      price: item.price,
      priceCurrency: 'RUB',
      availability: inStock(item) ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url,
    },
  };
  return (
    <div data-layout="wide">
      <div className={styles.page}>
        <div className={styles.crumbs}>
          <Breadcrumbs items={crumbs} />
        </div>

        <div className={styles.layout}>
          <ProductGallery name={item.name} photos={photos} badges={productBadges(item, tags)} />

          <div className={styles.panel}>
            <h1 className={styles.title}>{item.name}</h1>
            <p className={styles.price}>{rub(item.price)}</p>
            {item.description && <p className={styles.description}>{item.description}</p>}

            {item.color && (
              <div className={styles.colors}>
                <p className={styles.colorLabel}>Цвет: {colorName(item.color)}</p>
                {variants.length > 1 && (
                  <ul className={styles.swatches} aria-label="Другие цвета">
                    {variants.map((variant) => (
                      <li key={variant._id}>
                        <Link
                          href={`/shop/${variant.slug}`}
                          className={styles.swatch}
                          style={{ '--swatch': colorHex(variant) ?? 'var(--color-line)' } as React.CSSProperties}
                          aria-label={colorName(variant.color)}
                          aria-current={variant._id === item._id ? 'true' : undefined}
                          title={colorName(variant.color)}
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            <ProductPurchase key={item._id} item={item} sizeChart={sizeChartFor(item)} />
            <ProductTrust rating={rating} />
          </div>
        </div>
      </div>

      <SheetCut index={0} />
      {similar.length > 0 && (
        <Section tone="white" labelledBy="similar-title">
          <SectionHead
            titleId="similar-title"
            title="Похожие модели"
          />
          <ProductGrid products={similar} all={all} tags={tags} titleAs="h3" label="Похожие модели" />
          {category && (
            <div className={styles.more}>
              <MoreLink href={category.href}>Весь раздел</MoreLink>
            </div>
          )}
        </Section>
      )}

      <RecentlyViewed currentSlug={item.slug} all={all.map(toCardProduct)} />

      <MarkupScript jsonLd={jsonLd} />
    </div>
  );
};

export default ProductPage;
