import React from "react";
import { useParams, useHistory, useLocation } from "react-router-dom";
import { useState, useRef } from "react";
import { useSelector } from "react-redux";
import styles from './item-page.module.css';
import closeicon from '../../components/images/closeIcon.svg';
import { useDispatch } from "react-redux";
import { ADD_TO_CART } from "../../services/actions/cart-actions.jsx";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper";
import { apiBaseUrl } from "../../utils/constants";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";





const ItemPage = () => {

    
    const { id } = useParams();
    const { data } = useSelector(store => store.shopData);
    const { order } = useSelector(store => store.cartData);
 
    const history = useHistory();
    const dispatch = useDispatch();

    const intId = parseInt(id);
  
    const onClick = () => {
        history.goBack();
    }
    
 
    
    let item = data.length > 0 && data.filter(elem => elem.id === intId);
    const [ size, setSize ] = useState(item[0]?.attributes.sizes[0]);
    //console.log(item[0]);
    
    
    
 
   
   


  
    const onChange = (e) => {
        setSize(e.target.value);
       
        

    } 

    

    const addToCart = () => {

       
        const data = {
            attributes: {...item[0].attributes},
            cart_item_id: uuidv4(),
        };
        data.attributes.size = size;
        data.attributes.key = uuidv4();
        
        data.attributes.qty = 1;
        //data.cart_item_id = uuidv4();
        
       
        dispatch({
            type: ADD_TO_CART,
            payload: {...data},
        });
        history.goBack();
    }

    const descriptionArray = item[0]?.attributes.description.split('=');
    //console.log(descriptionArray);
    

    
    return (data.length > 0 && item &&
        <section className={styles.screen}>
            
            <div className={styles.close_icon_wrapper}>
                <img src={closeicon} alt='close icon' onClick={onClick} className={styles.close_icon}></img>
            </div>
            
            <div className={styles.shop_item_wrapper}>
                {item[0].attributes.galleryPhotos ? 
                (<Swiper className={styles.gallery_wrapper} navigation={true} pagination={true} modules={[Navigation, Pagination]}>
                    {item[0].attributes.galleryPhotos.map((image, index) => (
                        <SwiperSlide className={styles.swiper_slide} key={index}>                        
                            <img src={`${apiBaseUrl}${image}`} alt='item' />
                        </SwiperSlide>
                    ))}       
                
                    
                </Swiper>) : (
                    <div className={styles.gallery_wrapper}>
                        <img src={`${apiBaseUrl}${item[0].attributes.image_url}`} alt='item' className={styles.gallery_image} />
                    </div>
                )}
                <div className={styles.item_info_wrapper}>
                    <div className={styles.item_info_block}>
                        
                        <h1 className={styles.item_title}>{item[0].attributes.name}</h1>
                        {!item[0].attributes.sale && <p className={styles.item_description}>
                            {item[0].attributes.description}    
                        </p>}
                        {item[0].attributes.sale && descriptionArray && descriptionArray.map((item, index) => (
                            <p className={styles.item_description} key={index}>
                            {item}    
                            </p>
                        )) }
                        <br />
                        {item[0].attributes.sale && <a href='https://instagram.com/easyvisa_inc' target='blank'>instagram</a>}
                        {item[0].attributes.sale && <a href='https://easyvisainc.ru' target='blank'>сайт</a>}
                        <form className={styles.item_form}>
                            {!item[0].attributes.sale && <label className={styles.select_label} htmfor='sizeSelect'>Выберите размер:</label>}
                            {item[0].attributes.sale && <label className={styles.select_label} htmfor='sizeSelect'>Выберите код:</label>}
                            
                            <select className={styles.form_select} id='sizeSelect' name='sizeSelect' onChange={onChange}>
                                {item[0].attributes.sizes && item[0].attributes.sizes.map((item, index) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                               
                            </select>
                            {!item[0].attributes.sale &&
                            <Link to='/size_chart' className={styles.size_chart_link} target='blank'>(Гид по размерам)</Link>}
                        </form>
                        <p className={styles.item_price}>{item[0].attributes.price} Р.</p>
                    </div>

                    <div className={styles.item_button_wrapper}>
                        {!item[0].attributes.sale && <Link to={{ pathname: `/shop/${id}/constructor`, state: {size: size} }}>
                            <button type='button' className={styles.item_button}>ДОБАВИТЬ ПРИНТ</button>
                        </Link>}
                        <button type='button' className={styles.item_button} onClick={addToCart}>ДОБАВИТЬ В КОРЗИНУ</button>
                    </div>

                </div>
            </div>
        </section>
    )
}


export default ItemPage;


