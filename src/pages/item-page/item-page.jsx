import React from "react";
import { useParams, useHistory } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from './item-page.module.css';
import closeicon from '../../components/images/closeIcon.svg';
import { useDispatch } from "react-redux";
import { ADD_TO_CART } from "../../services/actions/cart-actions.jsx";
import { Link } from "react-router-dom";




const ItemPage = () => {

    const { id } = useParams();
    const { data } = useSelector(store => store.shopData);
    //const { order } = useSelector(store => store.cartData);
    const history = useHistory();
    const dispatch = useDispatch();

    const intId = parseInt(id);

    const onClick = () => {
        history.goBack();
    }

    
  


    const item = data.filter(elem => elem.id === intId);

    const addToCart = () => {
        dispatch({
            type: ADD_TO_CART,
            payload:  item[0]
        });
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
                    <p className={styles.item_price}>{item[0].attributes.price} Р.</p>
                </div>

                <div className={styles.item_info_block}>
                    <Link to='/constructor'>
                        <button type='button' className={styles.item_button}>ДОБАВИТЬ ПРИНТ</button>
                    </Link>
                    <button type='button' className={styles.item_button} onClick={addToCart}>ДОБАВИТЬ В КОРЗИНУ</button>
                </div>

            </div>
        </section>
    )
}


export default ItemPage;