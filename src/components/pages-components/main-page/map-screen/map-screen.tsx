import React from "react";
import styles from './map-screen.module.css'

import MapComponent from "./map-component";
import Link from "next/link";
import Image from "next/image";
import shape from '../../../../../public/map_shape.svg';
import UtmLink from "@/components/shared-components/utm-link/utm-link";
// import vk from '../../../../../public/vk_logo.svg';
import tg from '../../../../../public/tg_logo.svg';
// import inst from '../../../../../public/inst_logo.svg';
import wa from '../../../../../public/wa_logo.svg';


const MapScreen: React.FC = () => {

    return (
        <section className={styles.screen} id='contacts'>
            <h2 className={styles.screen_title}>Качественная печать на любой одежде от студии pinhead</h2>
            <span className={styles.screen_titleText}> раскрывают твою индивидуальность</span>
            <div className={styles.screen_mapBox}>
                <MapComponent />
                <div className={styles.mapBox_contacts}>
                    <p className={styles.contacts_text}>Режим работы: ежедневно, 11:00–20:00</p>
                    <p className={styles.contacts_text}>Телефон: +7 (812) 904-61-56</p>
                    <p className={styles.contacts_text}>Email: STUDIO@PNHD.RU</p>
                    <p className={styles.contacts_text}>Адрес: 197022, г. Санкт-Петербург, ул. Чапыгина, д. 1, ст. м. «Петроградская»</p>
                    <p className={styles.contacts_text}>Как добраться?<br />
                        Удобное расположение в центре города. Подробную схему проезда и парковки вы можете узнать у нашего менеджера.
                    </p>

                    <div className={styles.contacs_buttonsWrapper}>
                        <span className={styles.contacts_contactsButton}>+7 (812) 904 61 56</span>
                        <button type='button' className={styles.contacts_contactsButton}>studio@pnhd.ru</button>
                        <UtmLink pathname='/shop'>
                            <button type='button' className={styles.contacts_leadButton}>перейти в конструктор</button>
                        </UtmLink>
                    </div>

                    <p className={styles.contacts_text}>
                        197022, г. Санкт-Петербург, ул. Чапыгина,
                        д. 1, ст. м. «Петроградская»
                    </p>

                    <div className={styles.contacts_socialsWrapper}>
                        {/* <Link href='https://vk.com/pinheadspb' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <Image src={vk} alt='логотип вконтакте' />
                            </button>
                        </Link> */}
                        <Link href='https://telegram.me/pnhd_studio' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <Image src={tg} alt='логотип телеграм' />
                            </button>
                        </Link>
                        {/* <Link href='https://instagram.com/pnhd.studio/' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <Image src={inst} alt='логотип инстаграм' />
                            </button>
                        </Link> */}
                        {/* <Link href='https://wa.me/79313566552' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <Image src={wa} alt='логотип ватсап' />
                            </button>
                        </Link> */}
                        <Link href='https://max.ru/u/f9LHodD0cOLPoya-nl--At_duzt7fmJjN6-3xbnFVdcytMmjXzFDz4fRzDU' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <svg width="40" height="40" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M20.0002 5.27778V14.7222C19.9927 14.8136 19.9849 14.905 19.9774 14.9964C19.938 15.4658 19.9322 15.9411 19.8533 16.4039C19.5905 17.9417 18.6788 18.9806 17.2844 19.6158C16.7558 19.8567 16.1799 19.9089 15.6063 19.9472C15.3119 19.9669 15.0172 19.9825 14.7224 20H5.19466C5.14521 19.9928 5.09604 19.9839 5.04632 19.9789C4.46743 19.9206 3.8766 19.9175 3.31216 19.7939C2.0316 19.5131 1.13354 18.7075 0.514933 17.5747C0.197155 16.9933 0.111044 16.3508 0.0593772 15.7028C0.0354883 15.4042 0.0199327 15.1047 0.000488281 14.8058C0.000488281 11.5928 0.000488281 8.38 0.000488281 5.16694C0.00798828 5.1175 0.0185438 5.06806 0.0221549 5.01833C0.0510438 4.62667 0.0654883 4.23333 0.109377 3.84306C0.279377 2.32389 1.10354 1.25083 2.41354 0.522222C3.00993 0.190278 3.67188 0.1075 4.33882 0.0555556C4.61466 0.0341667 4.89077 0.0183333 5.16688 0C8.36132 0 11.5558 0 14.7502 0C14.8233 0.00722222 14.8963 0.0158333 14.9694 0.0219444C15.448 0.0616667 15.933 0.0647222 16.4044 0.146667C17.9685 0.418333 19.0174 1.34972 19.6419 2.78056C19.8549 3.26833 19.9041 3.79861 19.943 4.32528C19.9663 4.6425 19.9813 4.96056 19.9999 5.27806L20.0002 5.27778ZM6.77771 16.3372C6.79466 16.3442 6.80382 16.3464 6.81132 16.3511C6.83049 16.3639 6.84938 16.3775 6.86799 16.3914C7.6416 16.9631 8.48271 17.3386 9.46354 17.4006C10.9594 17.4953 12.376 17.2436 13.6913 16.5158C15.3438 15.6017 16.5035 14.2528 17.1527 12.4783C17.6188 11.2044 17.713 9.89306 17.4769 8.55861C17.1733 6.84139 16.3855 5.38083 15.083 4.22556C13.3188 2.66111 11.2402 2.09639 8.91854 2.42667C7.8366 2.58056 6.82993 2.96139 5.90438 3.55083C4.58299 4.3925 3.6066 5.52611 2.98743 6.96667C2.34715 8.45611 2.3166 10.0075 2.51215 11.5828C2.62271 12.4744 2.84549 13.3414 3.07965 14.2067C3.30938 15.0553 3.49965 15.91 3.50577 16.7972C3.50771 17.0672 3.66216 17.2661 3.91521 17.3736C4.19438 17.4922 4.48604 17.4839 4.77466 17.4267C5.55216 17.2731 6.23104 16.9333 6.77771 16.3375V16.3372Z" fill="black" />
                                    <path d="M8.00464 13.066C7.7288 13.276 7.48408 13.4813 7.22019 13.6577C6.95797 13.833 6.8263 13.7905 6.67463 13.5102C6.45186 13.0985 6.35713 12.6455 6.27908 12.1902C6.14852 11.4296 6.11602 10.6624 6.19852 9.8963C6.3188 8.78158 6.70352 7.78074 7.54325 6.99602C8.08269 6.49185 8.72075 6.18491 9.45019 6.08657C10.6399 5.92602 11.6971 6.24019 12.5941 7.03935C13.3177 7.68435 13.751 8.4938 13.8649 9.46296C14.1116 11.5607 12.5616 13.3085 10.726 13.6463C9.8088 13.8152 8.96491 13.6444 8.17241 13.1707C8.11297 13.1352 8.05352 13.0994 7.99408 13.0641C7.99047 13.0621 7.98575 13.0624 8.00464 13.066Z" fill="black" />
                                </svg>
                            </button>
                        </Link>
                    </div>
                </div>
                <Image src={shape} alt='декоративный штрихкод' style={{ height: '100%', alignSelf: 'center', paddingLeft: '20px' }} />
            </div>
        </section>
    )
}

export default MapScreen;