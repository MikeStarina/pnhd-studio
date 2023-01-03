import React from "react";
import styles from './sizes-page.module.css';
import { apiBaseUrl } from "../../utils/constants";





const SizesPage = () => {

    return (
        <main className={styles.page}>
            <h1 className={styles.page_title}>РАЗМЕРЫ / SIZE CHART</h1>
            <section className={styles.section}>
                <h2 className={styles.section_title}>Футболка CLASSIC</h2>
                <img src={`${apiBaseUrl}/uploads/tee_classic_size_chart_add33f5a41.png`} alt='size chart classic tee' className={styles.img} />
            </section>
            <section className={styles.section}>
                <h2 className={styles.section_title}>Футболка OVERSIZE</h2>
                <img src={`${apiBaseUrl}/uploads/oversize_tee_size_chart_3bf834622c.png`} alt='size chart oversize tee' className={styles.img} />
            </section>
            <section className={styles.section}>
                <h2 className={styles.section_title}>Футболка PROMO</h2>
                <img src={`${apiBaseUrl}/uploads/tee_promo_size_chart_c8d920d834.png`} alt='size chart oversize tee' className={styles.img} />
            </section>
            <section className={styles.section}>
                <h2 className={styles.section_title}>Худи CLASSIC</h2>
                <img src={`${apiBaseUrl}/uploads/hoodie_classic_size_chart_436619146c.png`} alt='size chart oversize tee' className={styles.img} />
            </section>
        </main>
    )
}


export default SizesPage;
