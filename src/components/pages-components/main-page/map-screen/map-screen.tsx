import React from "react";
import styles from './map-screen.module.css'

import MapComponent from "./map-component";
import Link from "next/link";
import Image from "next/image";
import shape from '../../../../../public/map_shape.svg';
import UtmLink from "@/components/shared-components/utm-link/utm-link";
import vk from '../../../../../public/vk_logo.svg';
import tg from '../../../../../public/tg_logo.svg';
import inst from '../../../../../public/inst_logo.svg';
import wa from '../../../../../public/wa_logo.svg';


const MapScreen: React.FC = () => {

    return (
        <section className={styles.screen} id='contacts'>
            <h2 className={styles.screen_title}>
                Принты бывают разные, но с <span style={{color: 'rgb(153,255,0)'}}>Pinhead Studio</span> они всегда                
            </h2>
            <span className={styles.screen_titleText}> раскрывают твою индивидуальность</span>
            <div className={styles.screen_mapBox}>
                <MapComponent />
                <div className={styles.mapBox_contacts}>
                    <p className={styles.contacts_text}>
                        Режим работы: ежедневно, 11:00–20:00
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
                        <Link href='https://vk.com/pinheadspb' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <Image src={vk} alt='логотип вконтакте' />
                            </button>
                        </Link>
                        {/* <Link href='https://t.me/pnhd_studio_bot' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <Image src={tg} alt='логотип телеграм'/>
                            </button>
                        </Link> */}
                        <Link href='https://instagram.com/pnhd.studio/' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <Image src={inst} alt='логотип инстаграм' />
                            </button>
                        </Link>
                        {/* <Link href='https://wa.me/79313566552' target="blank">
                            <button type='button' className={styles.contacts_socialButton}>
                                <Image src={wa} alt='логотип ватсап' />
                            </button>
                        </Link> */}
                    </div>
                </div>
                <Image src={shape} alt='декоративный штрихкод' style={{ height: '100%', alignSelf: 'center', paddingLeft: '20px'}} />
            </div>
        </section>
    )
}

export default MapScreen;