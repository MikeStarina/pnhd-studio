import styles from './brief.module.css';

const Brief = ({ title, subtitle, type }) => {
  // Если приходит масив, добавляет стили
  const classBrief = Array.isArray(subtitle) ? styles.brief_subtitle_array : '';
  console.log(type);
  return (
    <section className={styles.brief}>
      {type === 'h3' ? (
        <h3 className={styles.brief_title}>{title}</h3>
      ) : (
        <h2 className={styles.brief_title}>{title}</h2>
      )}

      {classBrief ? (
        subtitle.map((el, i) => (
          <p className={`${styles.brief_subtitle} ${classBrief}`} key={i}>
            {el}
          </p>
        ))
      ) : (
        <p className={`${styles.brief_subtitle}`}>{subtitle}</p>
      )}
    </section>
  );
};

export default Brief;
