import React from 'react';
import { Link } from 'react-router-dom';
import styles from './constructor-screen.module.css';

function ConstructorScreen() {
  return (
    <section className={styles.screen}>
      <h5 className={styles.heading}>
        А КАК
        <span className={styles.textStyle_italic}> ПЕЧАТАЕТЕ?</span>
      </h5>
    </section>
  );
}

export default ConstructorScreen;
