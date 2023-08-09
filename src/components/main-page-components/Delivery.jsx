import styles from './Delivery.module.css';
import Moto from '../../ui/moto/moto';
import LogoCdek from '../../ui/logo/logo';

function Delivery() {
  return (
    <section className={styles.section}>
      <Moto className={styles.img} />
      <div className={styles.block}>
        <h4 className={styles.title}>А <span className={styles.textStyle_italic}>КАК</span> ПОЛУЧИТЬ?</h4>
        <div className={styles.block_text}>
          <h5 className={styles.block_title}>— САМОВЫВОЗ</h5>
          <p className={styles.text}>
            Из нашей студии в Санкт-Петербурге. Мы всегда рады гостям, поэтому ждем вас ежедневно с 11 до 20 по адресу ул. Чапыгина 1 (м. Петроградская).
          </p>
          <h5 className={styles.block_title}>— УЛЬТРАДОСТАВКА</h5>
          <p className={styles.text}>
            Ультра супер быстрая доставка в Москву и другие регионы нашей страны от наших друзей и партнеров СДЕК. Оформить можно в корзине при чекауте или через наших менеджеров.
          </p>
        </div>
        <LogoCdek className={styles.logoCdek} />
      </div>
    </section>
  );
}

export default Delivery;
