import React from "react";
import styles from './sizes-page.module.css';
import { apiBaseUrl } from "../../utils/constants";





const SizesPage = () => {

    return (
        <main className={styles.page}>
            <h1 className={styles.page_title}>РАЗМЕРЫ / SIZE CHART</h1>
            <section className={styles.section}>
                <h2 className={styles.section_title}>Футболка CLASSIC</h2>
                <img src={`${apiBaseUrl}/uploads/tee_classic_sizes_b68c775638.png`} alt='size chart classic tee' className={styles.img} />
            </section>
            <section className={styles.section}>
                <h2 className={styles.section_title}>Футболка OVERSIZE</h2>
                <img src={`${apiBaseUrl}/uploads/tee_oversize_sizes_a50a2325e4.png`} alt='size chart oversize tee' className={styles.img} />
            </section>
            <section className={styles.section}>
                <h2 className={styles.section_title}>Футболка PROMO</h2>
                <img src={`${apiBaseUrl}/uploads/tee_promo_sizes_feb5902f48.png`} alt='size chart promo tee' className={styles.img} />
            </section>
            <section className={styles.section}>
                <h2 className={styles.section_title}>Худи CLASSIC</h2>
                <img src={`${apiBaseUrl}/uploads/hoodie_classic_sizes_f318d41d05.png`} alt='size chart classic hoodie' className={styles.img} />
            </section>
        </main>
    )
}


export default SizesPage;
