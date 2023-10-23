import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import {
  Route, Switch, Redirect, useLocation,
} from 'react-router-dom';
import {
  OPEN_MODAL_MENU,
  CLOSE_MODAL_MENU,
  closePopupHeader,
  openPopupHeader,
} from '../../services/actions/utility-actions';
import { getShopData } from '../../services/actions/shop-data-actions';
// eslint-disable-next-line import/extensions
import methodsData from '../../data/printing-methods/methods-data';
// eslint-disable-next-line import/extensions
import typeOfPrintData from '../../data/type-of-print-data/data';
import productsData from '../../data/printing-products/products-data';
import PopupModel from '../popupModel/popupModel';
import MainPage from '../../pages/main-page/main-page';
import BurgerIcon from '../main-menu/burger-icon';
import MainMenu from '../main-menu/main-menu';
import Footer from '../footer/footer';
import ShopPage from '../../pages/shop-page/shop-page';
import Constructor from '../../pages/constructor-page/constructor-page';
import CartIcon from '../cart/cart-icon';
import Cart from '../../pages/cartPage/cartPage';
import Checkout from '../../pages/checkout/checkout';
import { RESTORE_CART_FROM_SSTORAGE, RESTORE_PRICE_FROM_SSTORAGE } from '../../services/actions/cart-actions';
import Oferta from '../../pages/oferta-page/oferta-page';
import Page404 from '../../pages/page-404/page-404';
import SizesPage from '../../pages/sizes-page/sizes-page';
import FullscreenMenu from '../main-menu/fullscreen-menu';
import PrintingMethod from '../../pages/printing-method/printing-method';
import TypeOfPrint from '../../pages/type-of-print/type-of-print';
import PopupCallBack from '../popupCallBack/popupCallBack';
import ProductCard from '../../pages/ProductCard/ProductCard';
import Blogs from '../../pages/blogs/blogs';
import ZagitovaPage from '../../pages/friends-page/zagitova-page';
import PrintingProduct from '../../pages/printing-product/printing-product';
import { getFriendProduct } from '../../services/actions/friends-actions';

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
    const autoSavedPrice = sessionStorage.getItem('price');
    if (autoSavedCart) {
      dispatch({
        type: RESTORE_CART_FROM_SSTORAGE,
        payload: JSON.parse(autoSavedCart),
      });
    }
    if (autoSavedPrice) {
      dispatch({
        type: RESTORE_PRICE_FROM_SSTORAGE,
        payload: JSON.parse(autoSavedPrice),
      });
    }
  }, []);

  useEffect(() => {
    dispatch(getShopData());
  }, []);
  useEffect(() => {
    dispatch(getFriendProduct('zagitova'));
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

  const closeMenu = () => {
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
      {(mainMenu.isVisible && location.pathname !== '/zagitova') && <MainMenu closeMenu={closeMenu} openPopup={handelOpenPopupHeader} />}
      {(!mainMenu.isVisible && location.pathname !== '/zagitova') && (
        <FullscreenMenu openPopup={handelOpenPopupHeader} />
      )}
      {(!mainMenu.isVisible && location.pathname !== '/zagitova') && (
        <BurgerIcon openMenu={openMenu} openPopup={handelOpenPopupHeader} />
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

        <Route exact path="/shop/:slug">
          {/* <ItemPage /> */}
          <ProductCard />
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

        <Route exact path="/pechat-na-futbolkah">
          <PrintingProduct method={productsData.futbolki} />
        </Route>

        <Route exact path="/pechat-na-hudi">
          <PrintingProduct method={productsData.hudi} />
        </Route>

        <Route exact path="/pechat-na-svitshotah">
          <PrintingProduct method={productsData.sweatshirt} />
        </Route>

        <Route exact path="/pechat-na-shopperah">
          <PrintingProduct method={productsData.shopper} />
        </Route>

        <Route exact path="/pechat-na-kepkah">
          <PrintingProduct method={productsData.cap} />
        </Route>

        <Route exact path="/blogs">
          <Blogs />
        </Route>

        <Route exact path="/zagitova">
          <ZagitovaPage />
        </Route>

        <Route exact path="/shop/:id/constructor">
          {useLocation().state ? <Constructor /> : <Redirect to="/shop" />}
        </Route>
        <Route exact path="/cart">
          {order.length > 0 ? <Cart /> : <Redirect to="/shop" />}
        </Route>
        <Route exact path="/checkout">
          {order.length > 0 ? <Checkout /> : <Redirect to="/checkout" />}
        </Route>
        <Route path="/">
          <Page404 />
        </Route>
      </Switch>
      {window.location.pathname !== '/zagitova' ? <Footer /> : null}
    </>
  );
}

export default App;
