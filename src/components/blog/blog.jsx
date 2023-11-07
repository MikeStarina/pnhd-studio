import React from 'react';
import styles from './blog.module.css';
import { apiBaseUrl } from '../../utils/constants';

function Blog({ type = 'blog', ...el }) {
  const photo = el.blog.find((item) => item.image);
  const styleDiv = type === 'main' ? styles.mainBlock : styles.block;

  return (
    <div className={styleDiv} style={{ backgroundImage: `url(${apiBaseUrl}${photo && photo.image})` }}>
      <h3 className={styles.title}>{el.title.toUpperCase()}</h3>
      <p className={styles.dataCreated}>{el.created}</p>
    </div>
  );
}

export default Blog;
