import React, { useState } from "react";
import styles from "./accordion.module.css";
import { accordionData } from "../../data/accordion/accordionData";

const Accordion = () => {
  const [isActive, setIsActive] = useState(null);
  const { main_text, data } = accordionData;
  const toggle = (index) => {
    if (isActive === index) {
      return setIsActive(null);
    }

    setIsActive(index);
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.accordion}>
        <p className={styles.accordion_mainText}>{main_text}</p>
        {data.map((item, index) => (
          <div className={styles.accordion_item} key={index}>
            <div
              className={styles.accordion_title}
              onClick={() => toggle(index)}
            >
              <span>
                {item.title_italicFirst ? (
                  <em>{item.title_italicFirst}&#32;</em>
                ) : (
                  ""
                )}
                {item.title || ""}&#32;
                {item.title_italicLast ? <em>{item.title_italicLast}</em> : ""}
              </span>
              {isActive === index ? "-" : "+"}
            </div>
            <div
              className={
                isActive === index
                  ? `${styles.accordion_content} ${styles.accordion_content_show}`
                  : `${styles.accordion_content}`
              }
            >
              {item.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Accordion;
