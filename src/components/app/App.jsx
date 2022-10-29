import React from 'react';
//import styles from './app.module.css';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { OPEN_MODAL_MENU, CLOSE_MODAL_MENU } from '../../services/actions/utility-actions';
import { Route, Switch, Redirect, useLocation } from 'react-router-dom';
import { getShopData } from '../../services/actions/shop-data-actions.jsx';



import MainPage from '../../pages/main-page/main-page.jsx';
import BurgerIcon from '../main-menu/burger-icon.jsx';
import MainMenu from '../main-menu/main-menu.jsx';
import ContactsPage from '../../pages/contacts/contacts-page.jsx';
import Footer from '../footer/footer.jsx';
import ShopPage from '../../pages/shop-page/shop-page.jsx';
import FaqPage from '../../pages/faq-page/faq-page.jsx';
import PricesPage from '../../pages/prices-page/prices-page.jsx';
import Constructor from '../../pages/constructor-page/constructor-page.jsx';
import CartIcon from '../cart/cart-icon.jsx';
import ItemPage from '../../pages/item-page/item-page.jsx';
import CartPage from '../../pages/cart-page/cart-page.jsx';
import LoginPage from '../../pages/login-page/login-page.jsx';
import RegisterPage from '../../pages/register-page/register-page.jsx';
import { updateAuth } from '../../services/actions/user-data-actions';
import { RESTORE_CART_FROM_SSTORAGE } from '../../services/actions/cart-actions';
import ForgotPassword from '../../pages/forgot-password/forgot-password';
import ProfilePage from '../../pages/profile-page/profile-page';




function App() {

const dispatch = useDispatch();
const { mainMenu } = useSelector(store => store.utilityState);
const { order, isVisible } = useSelector(store => store.cartData);
const { userAuth } = useSelector(store => store.userData);





useEffect(() => {
  const autoSavedCart = sessionStorage.getItem('cart');
  
  if (autoSavedCart) {
    dispatch({
      type: RESTORE_CART_FROM_SSTORAGE,
      payload: JSON.parse(autoSavedCart),
    })
  }

  const storageToken = localStorage.getItem('authToken');
  if (storageToken) {
    dispatch(updateAuth(storageToken));
  }
}, [])

useEffect(() => {
  dispatch(getShopData());
}, [dispatch])


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


const closeMenu = (e) => {
  dispatch({
    type: CLOSE_MODAL_MENU,
  })
}


  return (
    <> 
    {mainMenu.isVisible ? (<MainMenu closeMenu={closeMenu} />) : (<BurgerIcon openMenu={openMenu} />)}
    {order && order.length > 0 && isVisible && <CartIcon qty={order.length} />}
    <Switch>     

      <Route exact path='/'>
        <MainPage />
      </Route>

      <Route exact path='/contacts'>
        <ContactsPage />
      </Route>

      <Route exact path='/shop'>
        <ShopPage />
      </Route>

      <Route exact path='/faq'>
        <FaqPage />
      </Route>

      <Route exact path='/prices'>
        <PricesPage />
      </Route>

      <Route exact path='/profile'>
        {userAuth.isAuthenticated ? (<ProfilePage />) : (<Redirect to='/login' />)}
      </Route>

      <Route exact path='/shop/:id'>
        <ItemPage />
      </Route>

      <Route exact path='/login'>
        {/*<LoginPage />*/}
        {userAuth.isAuthenticated ? (<Redirect to='/shop' />) : (<LoginPage />)}
      </Route>

      <Route exact path='/register'>
        <RegisterPage />
        {/*userAuth.isAuthenticated ? (<Redirect to='/' />) : (<RegisterPage />)*/}
      </Route>

      <Route exact path='/forgot'>
        {/*<ForgotPassword />*/}
        {userAuth.isAuthenticated ? (<Redirect to='/' />) : (<RegisterPage />)}
      </Route>

      <Route exact path='/reset-password'>
       
        {/*userAuth.isAuthenticated ? (<Redirect to='/' />) : (<RegisterPage />)*/}
      </Route>



      <Route exact path='/shop/:id/constructor'>
        {useLocation().state ? (<Constructor />) : (<Redirect to='/shop' />)}
      </Route>

      <Route exact path='/checkout'>
        {order.length > 0 ? (<CartPage />) : (<Redirect to='/shop' />)}
      </Route>

     







    </Switch>

    <Footer />
    </>

  
  );
}

export default App;
