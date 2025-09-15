import React from "react";
import styles from './photos-screen.module.css';
import Image from "next/image";
import photos_screen_image_one from '../../../../../public/photos_screen_image_one.png'
import photos_screen_image_two from '../../../../../public/photos_screen_image_two.png'
import photos_screen_image_three from '../../../../../public/photos_screen_image_three.png'
import photos_screen_image_four from '../../../../../public/photos_screen_image_four.png'




const PhotosScreen: React.FC = () => {

    return (
        <section className={styles.screen}>
            <div className={styles.screen_largeBlock}>
                <div className={styles.imgWrapper}>
                    <Image src={photos_screen_image_one} alt='футболка с принтом' className={styles.largeBlock_image}   />
                </div>                
                <div className={styles.largeBlock_topImageWrapper}>
                    <Image src={photos_screen_image_four} alt='футболка с принтом' className={styles.largeBlock_topImage}   />
                </div>
                <h2 className={styles.screen_titleWrapper}>
                    <span className={styles.screen_title}>ОТРАЖАЙ</span>
                    <span className={styles.screen_subtitle}>индивидуальность в мерче</span>
                </h2>
            </div>
            <div className={styles.screen_column}>
                <div className={styles.screen_mediumBlock}>
                    <Image src={photos_screen_image_two} alt='Фото принтов' className={styles.mediumBlock_image} />
                </div>
                <div className={styles.screen_mediumBlock}>
                    <Image src={photos_screen_image_three} alt='Фото принтов' className={styles.mediumBlock_image} />
                </div>

            </div>
        </section>
    )
};

export default PhotosScreen;