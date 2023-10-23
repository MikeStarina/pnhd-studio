import React from 'react';
import styles from './blogs.module.css';
import Blog from '../../components/blog/blog';

function Blogs() {
  return (
    <section className={styles.section}>
      <Blog />
    </section>
  );
}

export default Blogs;
