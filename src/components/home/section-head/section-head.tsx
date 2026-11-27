import React from 'react';
import styles from './section-head.module.css';

/**
 * Шапка секции главной: крупный заголовок слева, пояснение справа (по нижнему краю заголовка).
 * Меток с номером раздела («[04] Каталог») на сайте нет — убраны 26.11.
 * Цвета берёт от секции (currentColor), поэтому работает на сером, белом и чёрном фоне.
 */
const SectionHead: React.FC<{
  title: React.ReactNode;
  titleId: string;
  lead?: React.ReactNode;
  /** Пояснение «прочитывается» при скролле: текст проявляется слово за словом в порядке чтения */
  readOnScroll?: boolean;
  /** h1 — когда шапка открывает отдельную страницу */
  as?: 'h1' | 'h2';
  /** Заголовок и пояснение под ним — по центру */
  centered?: boolean;
  /** Кнопка справа на линии низа заголовка (например, «Весь каталог →») — вместо пояснения. Только на компьютере: на планшете и телефоне шапка без кнопки */
  action?: React.ReactNode;
}> = ({ title, titleId, lead, readOnScroll = false, as: Heading = 'h2', centered, action }) => (
  <header className={styles.head} data-centered={centered || undefined} data-reveal-group>
    <div className={styles.row} data-action={action ? '' : undefined}>
      <Heading id={titleId} className={styles.title}>
        {title}
      </Heading>
      {lead && (
        <div className={styles.lead}>
          <p>{readOnScroll ? <span className={styles.read}>{lead}</span> : lead}</p>
        </div>
      )}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  </header>
);

export default SectionHead;
