import React from "react";
import { Link } from "react-router-dom";
import styles from './page-404.module.css';


const Page404 = () => {

    return (
        <section className={styles.page}>
            <h1 className={styles.title}>404</h1>
            <p className={styles.subtitle}>Page not found / Такой страницы не существует</p>
            <p className={styles.subtitle}>Вернуться на <Link className={styles.link}>главную</Link></p>
        </section>
    )
}

export default Page404;

