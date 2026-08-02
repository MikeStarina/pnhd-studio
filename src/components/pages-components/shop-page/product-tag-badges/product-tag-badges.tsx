'use client';

import React from 'react';
import { useGetTagsQuery } from '@/api/api';
import { toTagArray } from '@/app/utils/product-tags';
import styles from './product-tag-badges.module.css';

const badgeClassForSlug = (slug: string): string => {
  if (slug === 'sale') return styles.badge_sale;
  if (slug === 'new') return styles.badge_new;
  return styles.badge_default;
};

const ProductTagBadges: React.FC<{ tagIds?: string[] }> = ({ tagIds }) => {
  const ids = toTagArray(tagIds);
  const { data } = useGetTagsQuery(undefined, { skip: ids.length === 0 });

  if (ids.length === 0) return null;

  const tags = data?.data ?? [];
  const resolved = ids
    .map((id) => tags.find((tag) => tag._id === id))
    .filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));

  if (resolved.length === 0) return null;

  return (
    <>
      {resolved.map((tag) => (
        <span
          key={tag._id}
          className={`${styles.badge} ${badgeClassForSlug(tag.slug)}`}
        >
          {tag.label}
        </span>
      ))}
    </>
  );
};

export default ProductTagBadges;
