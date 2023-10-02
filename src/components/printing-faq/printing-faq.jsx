import React from 'react';
import styles from './printing-faq.module.css';
import circle50px from '../images/circle50px.png';

function PrintingFaq(data) {
  const { title, description, variants } = data;
  return (
    <section className={styles.screen}>
      <h3 className={styles.heading}>{title}</h3>
      {variants.map((item) => (
        <div className={styles.block_wrapper} key={item.screen_heading}>
          <img
              src={circle50px}
              className={styles.screen_circle}
              alt="circle"
          />
          <div className={styles.text_wrapper}>
            <h4 className={styles.screen_heading}>{item.screen_heading}</h4>
            {Array.isArray(item.screen_description) ? (
              item.screen_description.map((elem) => (
                <p
                      className={`${styles.screen_description} ${styles.screen_description_bottom}`}
                      key={elem}
                >
                  {elem}
                </p>
              ))
            ) : (
              <p className={styles.screen_description}>
                {item.screen_description}
              </p>
            )}
          </div>
        </div>
      ))}
      {Array.isArray(description) && (
        <>
          {description.map((item) => (
            <div className={styles.block_wrapper} key={item}>
              <p className={styles.bottom_description}>{item}</p>
            </div>
          ))}
        </>
      )}
      {(!Array.isArray(description) && description.length) > 3 && (
        <div className={styles.block_wrapper}>
          <p className={styles.bottom_description}>{description}</p>
        </div>
      )}
    </section>
  );
}

export default PrintingFaq;
