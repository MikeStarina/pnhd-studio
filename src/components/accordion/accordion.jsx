import React, { useState } from 'react';
import styles from './accordion.module.css';
import accordionData from '../../data/accordion/accordionData';

function Accordion() {
  const gt = '\u{003E}';
  const [isActive, setIsActive] = useState(null);
  const { mainText, data } = accordionData;
  const toggle = (index) => {
    if (isActive === index) {
      return setIsActive(null);
    }
    return setIsActive(index);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.accordion}>
        <p className={styles.accordion_mainText}>{mainText}</p>
        {data.map((item) => (
          <div className={styles.accordion_item} key={item.id}>
            <div className={styles.accordion_title} onClick={() => toggle(item.id)}>
              <span className={styles.accordion_gt}>{isActive === item.id ? '-' : gt}</span>
              <h2 className={styles.accordion_text}>
                {item.title_italicFirst ? (
                  <i>
                    {item.title_italicFirst}
                    &#32;
                  </i>
                ) : (
                  ''
                )}
                {item.title || ''}
                &#32;
                {item.title_italicLast ? <i>{item.title_italicLast}</i> : ''}
              </h2>
              {isActive != item.id && (
                <span className={styles.accordion_gt}>
                  &#62;
                  <span className={styles.accordion_gtRight}>&#62;</span>
                </span>
              )}
              {isActive === item.id && <span className={styles.accordion_gt}> </span>}
            </div>
            <div
              className={
                isActive === item.id ? `${styles.accordion_content} ${styles.accordion_content_show}` : `${styles.accordion_content}`
              }
            >
              {Array.isArray(item.content) ? (
                item.content.map((elem) => (
                  <p key={elem.id} className={styles.accordion_contentText}>
                    {elem.item}
                  </p>
                ))
              ) : (
                <p className={styles.accordion_contentText}>{item.content}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Accordion;
