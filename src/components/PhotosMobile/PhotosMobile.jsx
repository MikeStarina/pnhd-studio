import React from 'react';
import styles from './PhotosMobile.module.css';
import { apiBaseUrl } from '../../utils/constants';

function PhotosMobile(item) {
  console.log(item);
  return (
    <div className={styles.photo_box}>
      {item.galleryPhotos &&
        item.galleryPhotos.map((el, index) => (
          <img className={styles.photo} src={`${apiBaseUrl}${el}`} alt={item.name} key={index} />
        ))}
    </div>
  );
}

export default PhotosMobile;
