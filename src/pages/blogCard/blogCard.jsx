import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './blogCard.module.css';
import { apiBaseUrl } from '../../utils/constants';
import { delOneBlogMemory, getBlogMemory } from '../../services/actions/blogs-actions';

function BlogCard() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(getBlogMemory());
    return () => dispatch(delOneBlogMemory());
  }, []);

  const { item } = useSelector((store) => store.blogsReducer);

  return (
    <div className={styles.container}>
      <h4 className={styles.title}>{item && item.title && item.title.toUpperCase()}</h4>
      <p className={styles.dataTime}>{item && item.createdAt}</p>
      {item && item.blog && item.blog.map((el, i) => (
        el.subtitle ? <h5 key={[i]} className={styles.subtitle}>{el.subtitle}</h5>
          : el.text ? el.text.map((art, index) => (
            <p className={styles.text} key={[index + 15]}>{art}</p>
          ))
            : el.image ? <img className={styles.image} src={`${apiBaseUrl}${el.image}`} alt={el.alt} key={[i]} />
              : null
      ))}
    </div>
  );
}

export default BlogCard;
