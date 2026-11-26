import React from 'react';
import styles from './section.module.css';

type Tone = 'white' | 'black';

/** Секция главной во всю ширину экрана: фон, вертикальные отступы и колонка контента по сетке страницы. */
const Section: React.FC<{
  tone: Tone;
  id?: string;
  labelledBy?: string;
  /** На компьютере секция занимает ровно экран под шапкой */
  fitScreen?: boolean;
  /** Полоса во всю ширину, с которой начинается секция (бегущая строка) */
  strip?: React.ReactNode;
  /** Декор за содержимым (например, home/corner-star): секция обрезает всё, что выходит за её края */
  decor?: React.ReactNode;
  children: React.ReactNode;
}> = ({ tone, id, labelledBy, fitScreen, strip, decor, children }) => (
  <section
    id={id}
    className={styles.section}
    data-tone={tone}
    data-surface={tone === 'black' ? 'dark' : undefined}
    aria-labelledby={labelledBy}
    data-fit-screen={fitScreen || undefined}
    data-strip={strip ? '' : undefined}
    data-decor={decor ? '' : undefined}
  >
    {decor && (
      <div className={styles.decor} aria-hidden="true">
        {decor}
      </div>
    )}
    {strip}
    <div className={styles.inner}>{children}</div>
  </section>
);

export default Section;
