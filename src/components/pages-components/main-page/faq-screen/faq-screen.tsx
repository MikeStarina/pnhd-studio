import React from 'react';
import styles from './faq-screen.module.css';

import { faqArr } from '@/app/utils/constants';
import FaqCard from './faq-card';

import Image from 'next/image';
import faq1_image from '../../../../../public/faq_image1.png';
import faq2_image from '../../../../../public/faq_image2.png';
import faq3_image from '../../../../../public/faq_image3.png';
import shape from '../../../../../public/faq_shape.svg';


const FaqScreen = () => {

    return (
        <section className={styles.screen} id='faq'>
            <h2 className={styles.screen_title}>frequently asked questions</h2>
            <div className={styles.screen_wrapper}>
                <div className={styles.screen_faqCardsWrapper}>
                    {faqArr.map((item, index) => (
                        <FaqCard key={index} item={item} />
                    ))}
                </div>

                <div className={styles.screen_graphics}>
                    <div className={styles.graphics_column}>
                        <p className={styles.graphics_text}>F.</p>
                        <Image src={faq1_image} alt='футболка с принтом на человеке' className={styles.graphics_image} />
                        <p className={styles.graphics_text}>Q.</p>
                    </div>
                    <div className={styles.graphics_column}>
                        <Image src={faq2_image} alt='футболка с принтом на человеке' className={styles.graphics_image} />
                        <p className={styles.graphics_text}>A.</p>
                        <Image src={faq3_image} alt='футболка с принтом на человеке' className={styles.graphics_image} />
                    </div>
                    <Image src={shape} alt='фоновая графика' className={styles.graphics_background} />
                </div>
            </div>
        </section>
    )
}

export default FaqScreen;