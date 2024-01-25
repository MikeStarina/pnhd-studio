import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import styles from './blogGallery.module.css';
import Blog from '../blog/blog';
// import { getOneBlog } from '../../services/actions/blogs-actions';

function BlogGallery() {
  const { blogs } = useSelector((store) => store.blogsReducer);

  return (
    <section className={styles.section}>
      {blogs && blogs.length > 6 && (
        <>
          <h4 className={styles.heading}>
            БЛОГ /
            {' '}
            <span className={styles.textStyle_italic}>BLOG</span>
          </h4>
          <Link className={styles.link} to={{ pathname: 'blog/' }}>
            {blogs && blogs.slice(0, 6).map((el, index) => (
              <Blog {...el} type="main" key={[index + 20]} />
            ))}
          </Link>
        </>
      )}
    </section>
  );
}

export default BlogGallery;
