import styles from './advantages.module.css';

const AdvantagesComponent = () => {
    return (
        <div className={styles.advantages}>
            <div className={styles['advantage-card']}>
                <img src="/charge-rapide.png" alt="скорость" className={styles['advantage-card_img']}/>
                <div className={styles['advantage-card_title']}>Скорость и четкие сроки</div>
                <div className={styles['advantage-card_txt']}>Мы ценим ваше время. Сроки производства тиража четко прогнозируемы и оговариваются заранее. Вы всегда знаете, когда получите свой заказ.</div>
            </div>
            <div className={styles['advantage-card']}>
                <img src="/7657be888a1734982c82e34a26fff5bd.jpg" alt="качество" className={styles['advantage-card_img']}/>
                <div className={styles['advantage-card_title']}>Качество и надежность</div>
                <div className={styles['advantage-card_txt']}>Мы используем современные технологии печати, чтобы ваша продукция сохраняла яркость цветов и стойкость после множества стирок. Качественный результат на любой ткани — наш стандарт работы.</div>
            </div>
            <div className={styles['advantage-card']}>
                <img src="/5ff99b45c0869a731351dc84696c8c21.jpg" alt="прозрачность" className={styles['advantage-card_img']}/>
                <div className={styles['advantage-card_title']}>Простота и прозрачность</div>
                <div className={styles['advantage-card_txt']}>Минимальный тираж — от 1 штуки. Прозрачная стоимость — финальная сумма рассчитывается до начала работ и не меняется. Любая основа — мы печатаем на вашем собственном материале или поможем подобрать оптимальный текстиль.</div>
            </div>
        </div>
    )
}

export default AdvantagesComponent;