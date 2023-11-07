import React from 'react';
import { apiBaseUrl } from '../../utils/constants';
import styles from './Photos.module.css';

function Photos({ galleryPhotos, name }) {
  return (
    <div className={styles.photo_box}>
      {galleryPhotos && galleryPhotos.map((el) => (
        <img className={styles.photo} src={`${apiBaseUrl}${el}`} alt={name} key={el} />
      ))}
    </div>
  );
}

export default Photos;
