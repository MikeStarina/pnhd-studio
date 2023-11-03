import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './blogGallery.module.css';
import Blogs from '../../pages/blogs/blogs';

function BlogGallery() {
  const { blogs } = useSelector((store) => store.blogsReducer);
  return (
    <section className={styles.section}>
      {blogs && blogs.length > 3 && (
        <Link className={styles.link} to={{ pathname: 'blogs/' }}>
          <Blogs type="blogGallery" />
        </Link>
      )}
    </section>
  );
}

export default BlogGallery;
