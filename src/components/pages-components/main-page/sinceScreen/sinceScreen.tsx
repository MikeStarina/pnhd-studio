import React from "react";
import styles from './sinceScreen.module.css';



const SinceScreen: React.FC = () => {
    return (
        <section className={styles.screen}>
            <header className={styles.screen_header}>
                <h2 className={styles.screen_title}>Создаем мерч с <span>2015</span> года</h2>
                <p className={styles.screen_subtitle}>Мы не просто наносим принты — мы воплощаем ваши идеи. От безумных рисунков до личных фраз, которые будут видны издалека. Создаём стильную одежду для вас, ваших друзей и всей семьи, используя передовые технологии.</p>
            </header>
            <div className={styles.screen_content}>
                <div className={styles.screen_content_item}>
                    <h3 className={styles.screen_content_item_title}>Ваша фантазия — наш главный ориентир</h3>
                    <p className={styles.screen_content_item_text}>Напечатаем даже самый смелый и нестандартный рисунок.</p>
                </div>
                <div className={styles.screen_content_item}>
                    <h3 className={styles.screen_content_item_title}>Никто не пройдёт мимо</h3>
                    <p className={styles.screen_content_item_text}>Сделаем вашу фразу или логотип максимально яркими и заметными.</p>
                </div>
                <div className={styles.screen_content_item}>
                    <h3 className={styles.screen_content_item_title}>Заботимся о вас</h3>
                    <p className={styles.screen_content_item_text}>Печатаем только на качественной и комфортной одежде, приятной телу.</p>
                </div>
            </div>
        </section>
    )
}

export default SinceScreen;