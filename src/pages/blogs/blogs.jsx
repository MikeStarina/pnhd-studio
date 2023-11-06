import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './blogs.module.css';
import Blog from '../../components/blog/blog';
import { getOneBlog } from '../../services/actions/blogs-actions';

function Blogs() {
  const dispatch = useDispatch();
  const { blogs } = useSelector((store) => store.blogsReducer);

  const saveElement = (el) => {
    dispatch(getOneBlog(el));
  };

  return (
    <>
      <h1 className={styles.pageTitle}>
        БЛОГ /
        {' '}
        <i>BLOG</i>
      </h1>
      <section className={styles.section}>
        {blogs && blogs.map((el, index) => (
          <Link
            onClick={() => saveElement(el)}
            to={{ pathname: `/blog/${el.slug}` }}
            className={styles.link}
            key={el.id}
          >
            <Blog {...el} key={[index + 20]} />
          </Link>
        ))}
      </section>
    </>
  );
}

export default Blogs;
