import React from 'react';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';

// import required modules
import { Pagination, Navigation } from 'swiper/modules';
import { apiBaseUrl } from '../../utils/constants';
import styles from './PhotosMobile.module.css';

function PhotosMobile({ galleryPhotos, name }) {
  // console.log(name);
  return (
    <Swiper
      slidesPerView={1}
      spaceBetween={30}
      loop
      pagination={false}
      navigation={false}
      modules={[Pagination, Navigation]}
      className={styles.swiper}
    >
      {galleryPhotos && galleryPhotos.map((el) => (
        <SwiperSlide key={el} className={styles.swiper_slide}>
          <img src={`${apiBaseUrl}${el}`} alt={name} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// {item.galleryPhotos &&
// item.galleryPhotos.map((el, index) => (
//     <SwiperSlide key={index}>
//         <img src={`${apiBaseUrl}${el}`} alt={item.name} />
//     </SwiperSlide>
// ))}

export default PhotosMobile;
