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
    const [ size, setSize ] = useState(item[0].attributes.sizes[0]);
    console.log(item[0]);
    
    
    
 
   
   


  
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
                        <p className={styles.item_description}>
                            {item[0].attributes.description}    
                        </p>
                        <form className={styles.item_form}>
                            <label className={styles.select_label} htmfor='sizeSelect'>???????????????? ????????????:</label>
                            
                            <select className={styles.form_select} id='sizeSelect' name='sizeSelect' onChange={onChange}>
                                {item[0].attributes.sizes && item[0].attributes.sizes.map((item, index) => (
                                    <option key={index} value={item}>{item}</option>
                                ))}
                               
                            </select>
                            <Link to='/size_chart' className={styles.size_chart_link} target='blank'>(?????? ???? ????????????????)</Link>
                        </form>
                        <p className={styles.item_price}>{item[0].attributes.price} ??.</p>
                    </div>

                    <div className={styles.item_button_wrapper}>
                        <Link to={{ pathname: `/shop/${id}/constructor`, state: {size: size} }}>
                            <button type='button' className={styles.item_button}>???????????????? ??????????</button>
                        </Link>
                        <button type='button' className={styles.item_button} onClick={addToCart}>???????????????? ?? ??????????????</button>
                    </div>

                </div>
            </div>
        </section>
    )
}


export default ItemPage;


/**
 * 
 *              <Swiper className={styles.swiper} navigation={true} modules={[Navigation]}>
                
                    <SwiperSlide key={0} className={styles.swiper_slide}>
                        
                        <img src={`${apiBaseUrl}${item[0].attributes.image_url}`} alt='item' />
                    </SwiperSlide>
                    <SwiperSlide key={1} className={styles.swiper_slide}>
                        
                        <img src={`${apiBaseUrl}${item[0].attributes.image_url}`} alt='item' />
                    </SwiperSlide>
                   
                   
                    
                </Swiper>
 */