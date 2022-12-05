import React from "react";
import styles from './case-gallery.module.css';
import IMG_0404 from '../images/IMG_0404.jpg';
import sample1 from '../images/sample1.jpg';
import sample2 from '../images/sample2.jpg';
import sample3 from '../images/sample3.jpg';
import sample4 from '../images/sample4.jpg';
import sample5 from '../images/sample5.jpg';




const CaseGallery = () => {
    return (
        <>
        <section className={styles.fourth_screen}>
            <img className={styles.gallery_img} alt='print sample' src={IMG_0404}></img>
            <img className={styles.gallery_img} alt='print sample' src={sample1}></img>
            <img className={styles.gallery_img} alt='print sample' src={sample2}></img>
            <img className={styles.gallery_img} alt='print sample' src={sample3}></img>
            <img className={styles.gallery_img} alt='print sample' src={sample4}></img>
            <img className={styles.gallery_img} alt='print sample' src={sample5}></img>

           
        </section>
         <div className={styles.button_wrapper}>

         <a href='https://www.instagram.com/pnhd.studio/' target='blank'>
             <button type='button' className={styles.link_button}>INSTAGRAM</button>
         </a>
         <a href='https://vk.com/pinheadspb' target='blank'>
             <button type='button' className={styles.link_button}>VK</button>
         </a>
         </div>
         </>
    );
};

export default CaseGallery;