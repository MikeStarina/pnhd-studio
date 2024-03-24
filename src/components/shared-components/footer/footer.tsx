import React from 'react';
import styles from './footer.module.css';
import Link from 'next/link';
import Image from 'next/image';
import shape1 from '../../../../public/footer_shape_1.svg';
import shape2 from '../../../../public/footer_shape2.svg';
import LeadForm from '../lead-form/lead-form';



const Footer: React.FC = () => {

    return (
        <footer className={styles.footer}>
            <div className={styles.footer_columnOne}>
                <Link href={{ pathname: '/', hash: '#methods'}} className={styles.footer_link}>методы нанесения</Link>
                <Link href='/shop' className={styles.footer_link}>каталог</Link>
                <Link href={{ pathname: '/', hash: '#stages'}} className={styles.footer_link}>этапы работы</Link>
                <Link href={{ pathname: '/', hash: '#feedback'}} className={styles.footer_link}>отзывы</Link>
                <Link href={{ pathname: '/', hash: '#faq'}} className={styles.footer_link}>FAQ</Link>
                <Link href={{ pathname: '/', hash: '#contacts'}} className={styles.footer_link}>контакты</Link>

                <Image src={shape1} alt='картинка штрихкода'/>

                <p className={styles.footer_text}>© 2024. Все права защищены</p>
                <Link href='/' className={styles.footer_text}>Политика конфиденциальности</Link>
            </div>

            <div className={styles.footer_columnTwo}>
                <div className={styles.columnTwo_formWrapper}>
                    <LeadForm />
                </div>

                <div className={styles.columnTwo_logoWrapper}>
                    <Image src={shape2} alt='абстракная форма'/>
                    <p className={styles.footer_logo}>PINHEAD {'>'}&nbsp;STUDIO</p>
                </div>
            </div>

        </footer>
    )
}

export default Footer;