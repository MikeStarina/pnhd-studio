'use client';
import React, { useEffect, useState } from 'react';
import { IProduct } from '@/app/utils/types';
import Image from 'next/image';
import Link from 'next/link';
import { productMainPhotoUrl, rub } from '../data';
import styles from './recently-viewed.module.css';

const STORAGE_KEY = 'recently-viewed';
const MAX_STORED = 8;

const read = (): string[] => {
  try {
    const parsed: unknown = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    return Array.isArray(parsed) ? parsed.filter((slug): slug is string => typeof slug === 'string') : [];
  } catch {
    return [];
  }
};

/**
 * «Недавно смотрели»: мелкие карточки в один ряд (на телефоне — лента вбок), чтобы блок не спорил с «Похожими».
 * В localStorage лежат slug до 8 последних товаров, данные карточек — из каталога `all`, который страница уже загрузила.
 * Сервер и первый кадр клиента не рисуют ничего: список известен только в браузере; без истории блока нет.
 */
const RecentlyViewed: React.FC<{ currentSlug: string; all: IProduct[] }> = ({ currentSlug, all }) => {
  const [slugs, setSlugs] = useState<string[]>([]);

  useEffect(() => {
    const previous = read();
    setSlugs(previous);
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([currentSlug, ...previous.filter((slug) => slug !== currentSlug)].slice(0, MAX_STORED))
      );
    } catch {}
  }, [currentSlug]);

  const products = slugs
    .filter((slug) => slug !== currentSlug)
    .flatMap((slug) => all.find((product) => product.slug === slug) ?? []);
  if (products.length === 0) return null;

  return (
    <section className={styles.recent} aria-labelledby="recent-title">
      <div className={styles.inner}>
        <h2 id="recent-title" className={styles.title}>
          Недавно смотрели
        </h2>
        <ul className={styles.list}>
          {products.map((product) => (
            <li key={product._id}>
              <Link href={`/shop/${product.slug}`} className={styles.item}>
                <span className={styles.thumb}>
                  <Image src={productMainPhotoUrl(product)} alt="" fill sizes="160px" className={styles.photo} />
                </span>
                <span className={styles.name}>{product.name}</span>
                <span className={styles.price}>{rub(product.price)}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};

export default RecentlyViewed;
