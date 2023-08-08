import { apiBaseUrl } from '../../utils/constants';
import styles from './Photos.module.css';

function Photos(item) {
  // console.log(item);

  return (
    <div className={styles.photo_box}>
      {item.galleryPhotos &&
        item.galleryPhotos.map((el, index) => (
          <img className={styles.photo} src={`${apiBaseUrl}${el}`} alt={item.name} key={index} />
        ))}
    </div>
  );
}

export default Photos;
