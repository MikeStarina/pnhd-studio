'use client';
import React from 'react';
import styles from './FormScreen.module.css';
import Image from 'next/image';
import cover from './cover.png'
import LeadButton from '@/components/shared-components/lead-button/lead-button';

const FormScreen: React.FC = () => {
    return (
        <section className={styles.screen}>
            <div className={styles.screen_imgWrapper}>
                <Image src={cover} alt='форма' />
            </div>
            <div className={styles.screen_content}>
                <p className={styles.screen_content_title}>
                    Рассчитаем стоимость нанесения за 15 минут
                </p>

                <p className={styles.screen_content_text}>
                    Есть логотип для нанесения? Отправьте заявку и получите готовый расчёт по цене и срокам в телефонном режиме. Мы перезвоним в течение 15 минут.
                </p>

                <LeadButton styleType='green' />
            </div>
        </section>
    )
}

export default FormScreen;