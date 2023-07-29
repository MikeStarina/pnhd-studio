import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Route, Switch, Redirect, useLocation,
} from 'react-router-dom';
import {
  OPEN_MODAL_MENU,
  CLOSE_MODAL_MENU,
  SET_POPUP_VISIBILITY,
  closePopupHeader,
  openPopupHeader,
} from '../../services/actions/utility-actions';
import { getShopData } from '../../services/actions/shop-data-actions.jsx';
import { methodsData } from '../../data/printing-methods/methods-data';
import { typeOfPrintData } from '../../data/type-of-print-data/data';

import PopupModel from '../popupModel/popupModel';
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
import FullscreenMenu from '../main-menu/fullscreen-menu';
import PrintingMethod from '../../pages/printing-method/printing-method';
import TypeOfPrint from '../../pages/type-of-print/type-of-print';
import PopupCallBack from '../popupCallBack/popupCallBack';

function App() {
  const dispatch = useDispatch();
  const { mainMenu, isPopupVisible } = useSelector(
    (store) => store.utilityState,
  );
  const { order, isVisible } = useSelector((store) => store.cartData);

  const location = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  useEffect(() => {
    const oldScript = document.querySelector('#calltr');
    document.body.removeChild(oldScript);
    const script = document.createElement('script');
    script.src = 'https://cdn.callibri.ru/callibri.js';
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.defer = true;
    script.id = 'calltr';
    document.body.prepend(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  useEffect(() => {
    const autoSavedCart = sessionStorage.getItem('cart');
    // console.log(autoSavedCart);

    if (autoSavedCart) {
      dispatch({
        type: RESTORE_CART_FROM_SSTORAGE,
        payload: JSON.parse(autoSavedCart),
      });
    }
  }, []);

  useEffect(() => {
    dispatch(getShopData());
  }, []);

  useEffect(() => {
    dispatch({
      type: CLOSE_MODAL_MENU,
    });
  }, [dispatch]);

  const openMenu = () => {
    dispatch({
      type: OPEN_MODAL_MENU,
    });
  };

  const handelClosePopupHeader = () => {
    dispatch(closePopupHeader());
  };

  const handelOpenPopupHeader = () => {
    dispatch(openPopupHeader());
  };

  const closeMenu = (e) => {
    dispatch({
      type: CLOSE_MODAL_MENU,
    });
  };

  return (
    <>
      {isPopupVisible && (
        <PopupModel onClose={handelClosePopupHeader}>
          <PopupCallBack />
        </PopupModel>
      )}
      {mainMenu.isVisible && <MainMenu closeMenu={closeMenu} />}
      {!mainMenu.isVisible && (
        <FullscreenMenu openPopup={handelOpenPopupHeader} />
      )}
      {!mainMenu.isVisible && (
        <BurgerIcon
          openMenu={openMenu}
          openPopup={handelOpenPopupHeader}
        />
      )}
      {order && order.length > 0 && isVisible && (
        <CartIcon qty={order.length} />
      )}
      <Switch>
        <Route exact path="/">
          <MainPage />
        </Route>

        <Route exact path="/oferta">
          <Oferta />
        </Route>

        <Route exact path="/shop">
          <ShopPage />
        </Route>

        <Route exact path="/shop/:id">
          <ItemPage />
        </Route>

        <Route exact path="/size_chart">
          <SizesPage />
        </Route>

        <Route exact path="/termotransfernaya-pechat">
          <PrintingMethod method={methodsData.termo} />
        </Route>

        <Route exact path="/vishivka">
          <PrintingMethod method={methodsData.vishivka} />
        </Route>

        <Route exact path="/shelkografiya">
          <PrintingMethod method={methodsData.silk} />
        </Route>

        <Route exact path="/pryamaya-dtg-pechat">
          <PrintingMethod method={methodsData.dtg} />
        </Route>

        <Route exact path="/dtf-pechat">
          <PrintingMethod method={methodsData.dtf} />
        </Route>

        <Route exact path="/pechat-logotipa">
          <TypeOfPrint method={typeOfPrintData.logo} />
        </Route>

        <Route exact path="/pechat-familii">
          <TypeOfPrint method={typeOfPrintData.numberAndSurname} />
        </Route>

        <Route exact path="/pechat-photo">
          <TypeOfPrint method={typeOfPrintData.photo} />
        </Route>

        <Route exact path="/pechat-printov">
          <TypeOfPrint method={typeOfPrintData.image} />
        </Route>

        <Route exact path="/pechat-nadpisej">
          <TypeOfPrint method={typeOfPrintData.inscriptions} />
        </Route>

        <Route exact path="/shop/:id/constructor">
          {useLocation().state ? (
            <Constructor />
          ) : (
            <Redirect to="/shop" />
          )}
        </Route>

        <Route exact path="/checkout">
          {order.length > 0 ? <CartPage /> : <Redirect to="/shop" />}
        </Route>

        <Route path="/">
          <Page404 />
        </Route>
      </Switch>

      <Footer />
    </>
  );
}

export default App;
