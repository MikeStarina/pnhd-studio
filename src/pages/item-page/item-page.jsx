import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { useState } from "react";
import { useSelector } from "react-redux";
import styles from './item-page.module.css';
import closeicon from '../../components/images/closeIcon.svg';
import { useDispatch } from "react-redux";
import { ADD_TO_CART } from "../../services/actions/cart-actions.jsx";
import { v4 as uuidv4 } from "uuid";
import { Link } from "react-router-dom";





const ItemPage = () => {

    const [ size, setSize ] = useState('XS');
    const { id } = useParams();
    const { data } = useSelector(store => store.shopData);
  
    const history = useHistory();
    const dispatch = useDispatch();

    const intId = parseInt(id);

    const onClick = () => {
        history.goBack();
    }

    
    


    const item = data.filter(elem => elem.id === intId);
    item[0].attributes.size = size;
    item[0].attributes.qty = 1;
    item[0].cart_item_id = uuidv4();
    console.log(item[0]);

   

   
   


  
    const onChange = (e) => {
        setSize(e.target.value);
        item[0].attributes.sizes = size;

    } 

    

    const addToCart = () => {

       
     
       console.log(item[0]);
        
       
        dispatch({
            type: ADD_TO_CART,
            payload: item[0]
        });
        history.goBack();
    }
    


    return (
        <section className={styles.screen}>
            <div className={styles.gallery_wrapper}>
            <img src={item[0].attributes.image_url} alt='item' className={styles.gallery_image}></img>
            </div>
            <div className={styles.item_info_wrapper}>
                <div className={styles.item_info_block}>
                    <img src={closeicon} alt='close icon' onClick={onClick} className={styles.close_icon}></img>
                    <h1 className={styles.item_title}>{item[0].attributes.name}</h1>
                    <p className={styles.item_description}>
                        Lorem ipsum dolor sit amet consectetur adipisicing elit. Earum magnam esse maiores, nam, veritatis vitae ipsam incidunt sit delectus velit distinctio. Deleniti reprehenderit corrupti rerum id natus laudantium soluta vero.
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
                    <Link to={{ pathname: `/shop/${id}/constructor`, state: item[0] }}>
                        <button type='button' className={styles.item_button}>ДОБАВИТЬ ПРИНТ</button>
                    </Link>
                    <button type='button' className={styles.item_button} onClick={addToCart}>ДОБАВИТЬ В КОРЗИНУ</button>
                </div>

            </div>
        </section>
    )
}


export default ItemPage;