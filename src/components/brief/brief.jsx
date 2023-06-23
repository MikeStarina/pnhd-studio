import styles from './brief.module.css';

const Brief = ({ title, subtitle }) => {
    // Если приходит масив, добавляет стили
    const classBrief = Array.isArray(subtitle)
        ? styles.brief_subtitle_array
        : '';

    return (
        <section className={styles.brief}>
            <h2 className={styles.brief_title}>{title}</h2>
            {classBrief ? (
                subtitle.map((el, i) => (
                    <p
                        className={`${styles.brief_subtitle} ${classBrief}`}
                        key={i}
                    >
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
