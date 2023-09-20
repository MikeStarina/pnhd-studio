import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import styles from './first-screen.module.css';
import bgvideo from '../../bgvideo.webm';
import videoposter from '../../videoposter.jpg';

function FirstScreen() {
  return (
    <section className={styles.main_screen}>
      <div className={styles.video_container}>
        <video
          autoPlay="autoPlay"
          muted="muted"
          loop="loop"
          poster={videoposter}
          className={styles.background_video}
        >
          <source
            src={bgvideo}
            type="video/webm"
            className={styles.video}
          />
        </video>
      </div>

      <div className={styles.video_overlay} />
      <h1 className={styles.main_heading}>НАПЕЧАТАЕМ!</h1>
      <span className={styles.textStyle_italic}>
        <h2 className={styles.main_heading}>НАПЕЧАТАЕМ!</h2>
      </span>
      <h3 className={styles.main_heading}>НАПЕЧАТАЕМ!</h3>

      <p className={styles.main_description}>
        На наших или твоих
        <span className={styles.textStyle_italic}>
                    &nbsp;/трендовых/&nbsp;
        </span>
        футболках и худи от 15 минут*! Клик, чтобы начать!
      </p>
      <Link className={styles.link} to="/shop">
        <button type="button" className={styles.button}>
          КАТАЛОГ
        </button>
      </Link>
    </section>
  );
}

export default FirstScreen;
