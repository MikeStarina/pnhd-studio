import React from 'react';
//import styles from './app.module.css';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { OPEN_MODAL_MENU, CLOSE_MODAL_MENU, SET_POPUP_VISIBILITY } from '../../services/actions/utility-actions';
import { Route, Switch, Redirect, useLocation } from 'react-router-dom';
import { getShopData } from '../../services/actions/shop-data-actions.jsx';

import Popup from '../popup/popup';
import MainPage from '../../pages/main-page/main-page.jsx';
import BurgerIcon from '../main-menu/burger-icon.jsx';
import MainMenu from '../main-menu/main-menu.jsx';
import Footer from '../footer/footer.jsx';
import ShopPage from '../../pages/shop-page/shop-page.jsx';
import Constructor from '../../pages/constructor-page/constructor-page.jsx';
import CartIcon from '../cart/cart-icon.jsx';
import ItemPage from '../../pages/item-page/item-page.jsx';
import CartPage from '../../pages/cart-page/cart-page.jsx';
import { RESTORE_CART_FROM_SSTORAGE } from '../../services/actions/cart-actions';
import Oferta from '../../pages/oferta-page/oferta-page';
import Page404 from '../../pages/page-404/page-404';
import SizesPage from '../../pages/sizes-page/sizes-page';




function App() {

const dispatch = useDispatch();
const { mainMenu, isPopupVisible } = useSelector(store => store.utilityState);
const { order, isVisible } = useSelector(store => store.cartData);


const location = useLocation();
useEffect(() => {window.scrollTo(0, 0);}, [location])

useEffect(() => {

  
  window.ym(86217584, 'reachGoal', 'TEST_HIT');


}, [])


useEffect(() => {
  const autoSavedCart = sessionStorage.getItem('cart');
  //console.log(autoSavedCart);
  
  if (autoSavedCart) {
    dispatch({
      type: RESTORE_CART_FROM_SSTORAGE,
      payload: JSON.parse(autoSavedCart),
    })
  }


}, [])

useEffect(() => {
  dispatch(getShopData());
}, [])


useEffect(() => {
  dispatch({
      type: CLOSE_MODAL_MENU,
  })    
}, [dispatch])




const openMenu = () => {
  dispatch({
    type: OPEN_MODAL_MENU,
  })
}

const openPopup = () => {
  dispatch({
    type: SET_POPUP_VISIBILITY,
  })
}


const closeMenu = (e) => {
  dispatch({
    type: CLOSE_MODAL_MENU,
  })
}


  return (
    <> 
    {isPopupVisible && <Popup openPopup={openPopup} />}
    {mainMenu.isVisible ? (<MainMenu closeMenu={closeMenu} />) : (<BurgerIcon openMenu={openMenu} openPopup={openPopup} />)}
    {order && order.length > 0 && isVisible && <CartIcon qty={order.length} />}
    <Switch>     

      <Route exact path='/'>
        <MainPage />
      </Route>

      <Route exact path='/oferta'>
        <Oferta />
      </Route>

   
      <Route exact path='/shop'>
        <ShopPage />
      </Route>

  

      <Route exact path='/shop/:id'>
        <ItemPage />
      </Route>


      <Route exact path='/size_chart'>
        <SizesPage />
      </Route>

   



      <Route exact path='/shop/:id/constructor'>
        {useLocation().state ? (<Constructor />) : (<Redirect to='/shop' />)}
      </Route>

      <Route exact path='/checkout'>
        {order.length > 0 ? (<CartPage />) : (<Redirect to='/shop' />)}
      </Route>

      <Route path='/'>
        <Page404 />
      </Route>

     







    </Switch>

    <Footer />
    </>

  
  );
}

export default App;


