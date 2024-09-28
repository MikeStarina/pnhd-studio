import React from 'react'
import styles from './main-screen.module.css';
import saleBanner from '../../../../../public/sale_banner.png'
import Image from 'next/image';
import main_screen_shape_one from '../../../../../public/main_screen_shape_one.svg';
import main_screen_shape_two from '../../../../../public/main_screen_shape_two.svg';
import main_screen_tshirt from '../../../../../public/main_screen_tshirt.png';
import button_arrow from '../../../../../public/button_arrow.svg';
import LeadButton from '@/components/shared-components/lead-button/lead-button';
import Link from 'next/link';
import Tee from '@/components/shared-components/3d-tee/3d-tee';





const MainScreen: React.FC = () => {

    return (
        <section className={styles.screen}>
            <div className={styles.screen_cardsWrapper}>
            <div className={styles.screen_blocksColumn}>
                <div className={styles.screen_mediumBlock}>
                    <p className={styles.screen_title}>Напечатаем даже самый
                    безумный рисунок</p>
                    <p className={styles.screen_title}>Напечатаем фразу, которую
                    будет видно издалека</p>
                    <p className={styles.screen_title}>Напечатаем для тебя,
                    друзей и всей семьи</p>
                    <p className={styles.screen_title}>Напечатаем на стильной одежде</p>
                    <Image src={main_screen_shape_one} alt='форма' className={styles.mediumBlock_graphics}/>
                </div>
                <div className={styles.screen_blocksWrapper}>
                    
                    <div className={styles.screen_smallBlockOne}>
                        {/* Вот сюда */}
                        <div className={styles.smallBlockImageWrapper}>
                            {/* <Image src={main_screen_tshirt} alt='футболка' className={styles.smallBlock_image} /> */}
                            <Tee backdropStatus={true} fov={20} />
                        </div>
                        
                        <div className={styles.smallBlock_squareWrapper}>
                            <div className={styles.smallBlock_square}></div>
                        </div>
                            
                            
                            {/* <div className={styles.divForm_verticalHelper}>
                                
                            </div>
                            <div className={styles.divForm_horizontalHelper}></div>
                            <div className={styles.divform_main}></div> */}


                            <div className={styles.smallBlockOne_buttonWrapper}>
                                <Link href='/shop'>
                                    <button type='button' className={styles.smallBlockOne_button}>
                                        <Image src={button_arrow} alt='Стрелка на кнопке' className={styles.button_arrow}></Image>
                                    </button>
                                </Link>
                                
                            </div>
  
                    </div>
                    <div className={styles.screen_smallBlockTwo}>
                        {/* <div style={{width: '100%'}}>
                            <div className={styles.smallBlock_square}></div>
                        </div> */}
                        {/* <div className={styles.smallBlockTwo_textWrapper}>
                             
                            <p className={styles.screen_title}>шелкография</p>
                            <p className={styles.screen_title}>вышивка</p>
                            <p className={styles.screen_title}>dtf</p>
                            <p className={styles.screen_title}>dtg</p>
                        

                        </div> */}
                        <Image className={styles.banner} src={saleBanner} alt='' />
                        {/* <Image src={main_screen_shape_two} alt='форма' className={styles.smallBlock_graphics} /> */}
                         
                    </div>
                </div>
            </div>
            <div className={styles.screen_largeBlock}>
                <div className={styles.largeBlock_contentWrapper}>
                    <div className={styles.largeBlock_buttonsWrapper}>
                        <Link className={styles.largeBlock_link} href='/shop'>перейти в каталог</Link>
                        <LeadButton styleType='white' />
                    </div>
                    <h1 className={styles.screen_mainTitle}>
                        PINHEAD
                        <span className={styles.mainTitle_span}> STUDIO</span>
                    </h1>
                </div>
            </div>      

            </div>

            <div className={styles.screen_features}>
                <p className={styles.screen_feature}>{'> '}Наносим принты
                от 300Р.</p>
                <p className={styles.screen_feature}>{'> '}Доставляем
                по всей России СДЭКом</p>
                <p className={styles.screen_feature}>{'> '}Помогаем подобрать
                метод нанесения</p>
                <p className={styles.screen_feature}>{'> '}Корректируем расположение
                рисунка с дизайнером бесплатно</p>
            </div>

        </section>
    )
}

export default MainScreen