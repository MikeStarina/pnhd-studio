'use client'

import { useState } from 'react'
import type { FaqItem } from './data'
import styles from './faq.module.css'

const FaqList: React.FC<{ items: FaqItem[] }> = ({ items }) => {
  const [open, setOpen] = useState(0)

  return (
    <ul className={styles.list} data-reveal-group>
      {items.map((item, index) => {
        const isOpen = open === index
        return (
          <li key={item.question} className={styles.item}>
            <h3 className={styles.heading}>
              <button
                type="button"
                className={styles.button}
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
                onClick={() => setOpen(isOpen ? -1 : index)}
              >
                <span>{item.question}</span>
                <span className={styles.icon} aria-hidden="true" />
              </button>
            </h3>
            <div
              id={`faq-answer-${index}`}
              role="region"
              aria-labelledby={`faq-question-${index}`}
              className={isOpen ? `${styles.answer} ${styles.answerOpen}` : styles.answer}
            >
              <div className={styles.answerInner}>
                <p className={styles.answerText}>{item.answer}</p>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}

export default FaqList
