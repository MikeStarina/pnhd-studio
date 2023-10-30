import React from 'react';
import styles from './blog.module.css';

function Blog({ ...el }) {
  return (
    <div className={styles.block}>
      <h3 className={styles.title}>{el.title}</h3>
    </div>
  );
}

export default Blog;
