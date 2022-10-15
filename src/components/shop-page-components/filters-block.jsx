import React from "react";
import styles from './filters-block.module.css';



const FiltersBlock = () => {

    return (
        <section className={styles.screen}>
            
            <p className={styles.filter}>МУЖСКОЕ</p>
            <p className={styles.filter}>ЖЕНСКОЕ</p>
            <p className={styles.filter}>АКСЕССУАРЫ</p>
            <p className={styles.filter}>РАСПРОДАЖА</p>

        </section>
    );
}

export default FiltersBlock;