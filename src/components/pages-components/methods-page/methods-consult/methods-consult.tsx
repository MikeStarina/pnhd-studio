import Section from '@/components/home/section/section';
import PriceForm from '@/components/home/price-estimate/price-form';
import styles from './methods-consult.module.css';

/**
 * Консультация под методами (на старом /methods под бенто была форма «Проконсультироваться»):
 * серая карточка как блок цен на главной — слева заголовок, справа чёрная форма заявки менеджеру.
 */
export default function MethodsConsult() {
  return (
    <Section tone="white" id="consult" labelledBy="consult-title">
      <div className={styles.shell}>
        <div className={styles.text}>
          <h2 id="consult-title" className={styles.title}>
            Не знаешь, какой метод выбрать?
          </h2>
          <p className={styles.lead}>
            Оставь телефон — менеджер спросит, что и&nbsp;на&nbsp;чём печатаем, подскажет метод и&nbsp;посчитает цену
          </p>
        </div>
        <PriceForm source="methods" />
      </div>
    </Section>
  );
}
