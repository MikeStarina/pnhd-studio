import React from 'react';
import styles from './footer.module.css';
import Image from 'next/image';
import shape1 from '../../../../public/footer_shape_1.svg';
import shape2 from '../../../../public/footer_shape2.svg';
import LeadForm from '../lead-form/lead-form';
import UtmLink from '../utm-link/utm-link';



const Footer: React.FC = () => {

    return (
        <footer className={styles.footer}>
            <div className={styles.footer_columnOne}>
                <UtmLink pathname='/' hash='#methods' style={styles.footer_link}>методы нанесения</UtmLink>
                <UtmLink pathname='/shop' style={styles.footer_link}>каталог</UtmLink>
                <UtmLink pathname='/' hash='#stages' style={styles.footer_link}>этапы работы</UtmLink>
                <UtmLink pathname='/' hash='#feedback' style={styles.footer_link}>отзывы</UtmLink>
                <UtmLink pathname='/' hash='#faq' style={styles.footer_link}>FAQ</UtmLink>
                <UtmLink pathname='/' hash='#contacts' style={styles.footer_link}>контакты</UtmLink>

                <Image src={shape1} alt='картинка штрихкода'/>

                
                <p className={styles.footer_text}>ООО ПИНХЭД СТУДИО<br/>ИНН/КПП 7810463916/781301001</p>
                <p className={styles.footer_text}>© 2024. Все права защищены</p>
                <UtmLink pathname='/' style={styles.footer_text}>Политика конфиденциальности</UtmLink>
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