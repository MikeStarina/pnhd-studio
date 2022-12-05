import React, { useEffect } from "react";
import { useParams, useHistory } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import styles from './item-page.module.css';
import closeicon from '../../components/images/closeIcon.svg';
import { useDispatch } from "react-redux";
import { ADD_TO_CART } from "../../services/actions/cart-actions.jsx";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";
import { apiBaseUrl } from "../../utils/constants";





const ItemPage = () => {

    const [ size, setSize ] = useState('XS');
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
                <div className={styles.gallery_wrapper}>
                    <img src={`${apiBaseUrl}${item[0].attributes.image_url}`} alt='item' className={styles.gallery_image}></img>
                </div>
                <div className={styles.item_info_wrapper}>
                    <div className={styles.item_info_block}>
                        
                        <h1 className={styles.item_title}>{item[0].attributes.name}</h1>
                        <p className={styles.item_description}>
                            {item[0].attributes.description}    
                        </p>
                        <form className={styles.item_form}>
                            <label className={styles.select_label} htmfor='sizeSelect'>Выберите размер:</label>
                            <select className={styles.form_select} id='sizeSelect' name='sizeSelect' autoFocus onChange={onChange}>
                                <option value='XS'>XS</option>
                                <option value='S'>S</option>
                                <option value='M'>M</option>
                                <option value='L'>L</option>
                                <option value='XL'>XL</option>
                                <option value='XXL'>XXL</option>
                                <option value='XXL'>XXL</option>
                            </select>
                        </form>
                        <p className={styles.item_price}>{item[0].attributes.price} Р.</p>
                    </div>

                    <div className={styles.item_button_wrapper}>
                        <Link to={{ pathname: `/shop/${id}/constructor`, state: {size: size} }}>
                            <button type='button' className={styles.item_button}>ДОБАВИТЬ ПРИНТ</button>
                        </Link>
                        <button type='button' className={styles.item_button} onClick={addToCart}>ДОБАВИТЬ В КОРЗИНУ</button>
                    </div>

                </div>
            </div>
        </section>
    )
}


export default ItemPage;