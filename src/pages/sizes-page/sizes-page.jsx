import React from 'react';
import styles from './sizes-page.module.css';
import tee_classic_sizes from '../../tee_classic_sizes.png';
import tee_oversize_sizes from '../../tee_oversize_sizes.png';
import tee_promo_sizes from '../../tee_promo_sizes.png';
import tee_gildan_sizes from '../../tee_promo_sizes.png';
import hoodie_classic_sizes from '../../hoodie_classic_sizes.png';

function SizesPage() {
  return (
    <main className={styles.page}>
      <h1 className={styles.page_title}>РАЗМЕРЫ / SIZE CHART</h1>
      <section className={styles.section}>
        <h2 className={styles.section_title}>Футболки CLASSIC</h2>
        <img
          src={tee_classic_sizes}
          alt="size chart classic tee"
          className={styles.img}
        />
      </section>
      <section className={styles.section}>
        <h2 className={styles.section_title}>Футболки OVERSIZE</h2>
        <img
          src={tee_oversize_sizes}
          alt="size chart oversize tee"
          className={styles.img}
        />
      </section>
      <section className={styles.section}>
        <h2 className={styles.section_title}>Футболки PROMO</h2>
        <img
          src={tee_promo_sizes}
          alt="size chart promo tee"
          className={styles.img}
        />
      </section>
      <section className={styles.section}>
        <h2 className={styles.section_title}>Футболки GILDAN HAMMER</h2>
        <img
          src={tee_gildan_sizes}
          alt="size chart promo tee"
          className={styles.img}
        />
      </section>
      <section className={styles.section}>
        <h2 className={styles.section_title}>Худи CLASSIC</h2>
        <img
          src={hoodie_classic_sizes}
          alt="size chart classic hoodie"
          className={styles.img}
        />
      </section>
    </main>
  );
}

export default SizesPage;
