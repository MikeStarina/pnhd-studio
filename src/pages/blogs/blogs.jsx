import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './blogs.module.css';
import Blog from '../../components/blog/blog';
import { getOneBlog } from '../../services/actions/blogs-actions';

function Blogs({ type = 'def' }) {
  const dispatch = useDispatch();
  const { blogs } = useSelector((store) => store.blogsReducer);
  const [windowWidth, setWindowWidth] = useState(1);

  function getCurrentDimension() {
    return {
      width: window.innerWidth,
    };
  }

  const saveElement = (el) => {
    dispatch(getOneBlog(el));
  };

  const [screenWidth, setScreenWidth] = useState(getCurrentDimension());
  useEffect(() => {
    const updateDimension = () => {
      setScreenWidth(getCurrentDimension());
    };
    setWindowWidth(screenWidth.width <= 650 ? 1
      : screenWidth.width > 650 && screenWidth.width <= 960 ? 2
        : screenWidth.width > 960 && screenWidth.width <= 1200 ? 3
          : 4);
    window.addEventListener('resize', updateDimension);
    return () => {
      window.removeEventListener('resize', updateDimension);
    };
  }, [screenWidth]);

  return (
    <section className={styles.section}>
      {type === 'def' && blogs && blogs.map((el, index) => (
        <div className={styles.box} key={el._id}>
          <Link
            onClick={() => saveElement(el)}
            to={{ pathname: `/blogs/${el.slug}` }}
            className={styles.link}
            key={el.id}
          >
            <Blog {...el} key={[index + 20]} />
          </Link>
        </div>
      ))}
      {type === 'blogGallery' && blogs && blogs.slice(0, windowWidth).map((el, index) => (
        <div className={styles.box} key={el._id}>
          <Blog {...el} key={[index + 20]} />
        </div>
      ))}
    </section>
  );
}

export default Blogs;
