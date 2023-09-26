import React, { useState } from 'react';
import styles from './accordion.module.css';
import { accordionData } from '../../data/accordion/accordionData';

function Accordion() {
  const gt = '\u{003E}';
  const [isActive, setIsActive] = useState(null);
  const { mainText, data } = accordionData;
  const toggle = (index) => {
    if (isActive === index) {
      return setIsActive(null);
    }

    setIsActive(index);
  };

  return (
    <section className={styles.wrapper}>
      <div className={styles.accordion}>
        <p className={styles.accordion_mainText}>{mainText}</p>
        {data.map((item, index) => (
          <div className={styles.accordion_item} key={index}>
            <div className={styles.accordion_title} onClick={() => toggle(index)}>
              <span className={styles.accordion_gt}>{isActive === index ? '-' : gt}</span>
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
              {isActive != index && (
                <span className={styles.accordion_gt}>
                  &#62;
                  <span className={styles.accordion_gtRight}>&#62;</span>
                </span>
              )}
              {isActive === index && <span className={styles.accordion_gt}> </span>}
            </div>
            <div
              className={
                isActive === index ? `${styles.accordion_content} ${styles.accordion_content_show}` : `${styles.accordion_content}`
              }
            >
              {Array.isArray(item.content) ? (
                item.content.map((item, index) => (
                  <p key={index} className={styles.accordion_contentText}>
                    {item.item}
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
