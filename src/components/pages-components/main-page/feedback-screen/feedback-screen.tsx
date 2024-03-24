import React from 'react';
import styles from './feedback-screen.module.css';

import Image from 'next/image';
import rating_stars from '../../../../../public/rating_star.svg';
import feedback_image from '../../../../../public/feedback_image.svg';

import FeedbackBlock from './feedback-block';


const FeedbackScreen: React.FC = () => {

    return (
        <section className={styles.screen} id='feedback'>
            <div className={styles.screen_titleWrapper}>
                <div className={styles.screen_ratingWrapper}>
                    <div className={styles.rating_box}>
                        <p className={styles.rating_number}>5,0</p>
                        <Image src={rating_stars} alt='пять звезд рейтинга' />
                    </div>
                    <p className={styles.rating_text}>Оценка на Yandex и Google</p>
                </div>
                <h2 className={styles.screen_title}>
                    когда говорят о топовых принтах и заботливом сервисе, говорят о нас
                </h2>
            </div>
            <FeedbackBlock />
            <Image src={feedback_image} alt='логотип яндекса и гугла' className={styles.screen_image} />
        </section>
    )
}

export default FeedbackScreen;