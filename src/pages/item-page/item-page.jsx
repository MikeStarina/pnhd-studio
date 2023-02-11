import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { useState, useEffect } from "react";
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
    //console.log(data)

 
    const history = useHistory();
    const dispatch = useDispatch();

  
  
    const onClick = () => {
        history.goBack();
    }
    
 
    
    let item = data && data.length > 0 && data.filter(elem => elem._id === id)[0];
    //console.log(item);
    const [ size, setSize ] = useState('');
    
    
    
    
    useEffect(() => {
        item && item.sizes.length > 0 && setSize(item.sizes[0].name);
    }, [item])
   
   


  
    const onChange = (e) => {
        setSize(e.target.value);
       
        

    } 

    

    const addToCart = () => {

       
        const data = {
            attributes: {...item},
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

    const descriptionArray = item ? item.description.split('=') : [];
    //console.log(descriptionArray);

    
    

    
    return (data.length > 0 && item &&
        <section className={styles.screen}>
            
            <div className={styles.close_icon_wrapper}>
                <img src={closeicon} alt='close icon' onClick={onClick} className={styles.close_icon}></img>
            </div>
            
            <div className={styles.shop_item_wrapper}>
                {item.galleryPhotos ? 
                (<Swiper className={styles.gallery_wrapper} navigation={true} pagination={true} modules={[Navigation, Pagination]}>
                    {item.galleryPhotos.map((image, index) => (
                        <SwiperSlide className={styles.swiper_slide} key={index}>                        
                            <img src={`${apiBaseUrl}${image}`} alt='item' />
                        </SwiperSlide>
                    ))}       
                
                    
                </Swiper>) : (
                    <div className={styles.gallery_wrapper}>
                        <img src={`${apiBaseUrl}${item.image_url}`} alt='item' className={styles.gallery_image} />
                    </div>
                )}
                <div className={styles.item_info_wrapper}>
                    <div className={styles.item_info_block}>
                        
                        <h1 className={styles.item_title}>{item.name}</h1>
                        {!item.isSale && <p className={styles.item_description}>
                            {item.description}    
                        </p>}
                        {item.isSale && descriptionArray && descriptionArray.map((item, index) => (
                            <p className={styles.item_description} key={index}>
                            {item}    
                            </p>
                        )) }
                        <br />
                        {item.isSale && <a href='https://instagram.com/easyvisa_inc' target='blank'>instagram</a>}
                        {item.isSale && <a href='https://easyvisainc.ru' target='blank'>сайт</a>}
                        <form className={styles.item_form}>
                            {!item.isSale && <label className={styles.select_label} htmfor='sizeSelect'>Выберите размер:</label>}
                            {item.isSale && <label className={styles.select_label} htmfor='sizeSelect'>Выберите код:</label>}


                         






                            
                            <select className={styles.form_select} id='sizeSelect' name='sizeSelect' onChange={onChange}>
                                
                                {item.sizes.length > 0 ? item.sizes.map((item, index) => (
                                    <option key={index} value={item.name}>{item.name}</option>
                                )) : (<option>Нет в наличии</option>)} 
                               
                                </select> 
                            {!item.sale &&
                            <Link to='/size_chart' className={styles.size_chart_link} target='blank'>(Гид по размерам)</Link>}
                        </form>
                        <p className={styles.item_price}>{item.price} Р.</p>
                    </div>

                    <div className={styles.item_button_wrapper}>
                        {!item.isSale && item.sizes.length > 0 && <Link to={{ pathname: `/shop/${id}/constructor`, state: {size: size} }}>
                            <button type='button' className={styles.item_button}></button>
                        </Link>}
                        {item.sizes.length > 0 && <button type='button' className={styles.item_button} onClick={addToCart}></button>}
                    </div>

                </div>
            </div>
        </section>
    )
}


export default ItemPage;


