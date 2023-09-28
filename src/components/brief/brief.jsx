import { v4 as uuid } from 'uuid';
import styles from './brief.module.css';

function Brief({ title, subtitle, type }) {
  // Если приходит масив, добавляет стили
  const classBrief = Array.isArray(subtitle) ? styles.brief_subtitle_array : '';
  return (
    <section className={styles.brief}>
      {type === 'h3' ? (
        <h3 className={styles.brief_title}>{title}</h3>
      ) : (
        <h2 className={styles.brief_title}>{title}</h2>
      )}

      {classBrief ? (
        subtitle.map((el) => (
          <p className={`${styles.brief_subtitle} ${classBrief}`} key={uuid()}>
            {el}
          </p>
        ))
      ) : (
        <p className={styles.brief_subtitle}>{subtitle}</p>
      )}
    </section>
  );
}

export default Brief;
