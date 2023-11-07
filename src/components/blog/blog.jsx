import React from 'react';
import styles from './blog.module.css';
import { apiBaseUrl } from '../../utils/constants';

function Blog({ ...el }) {
  const photo = el.blog.find((item) => item.image);
  return (
    <div className={styles.block}>
      <h3 className={styles.title} style={{ backgroundImage: `url(${apiBaseUrl}${photo && photo.image})` }}>{el.title}</h3>
    </div>
  );
}

export default Blog;
