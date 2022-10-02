import React from 'react';
//import styles from './app.module.css';
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { OPEN_MODAL_MENU, CLOSE_MODAL_MENU } from '../../services/actions/utility-actions';
import { Route, Switch } from 'react-router-dom';



import MainPage from '../../pages/main-page/main-page.jsx';
import BurgerIcon from '../main-menu/burger-icon.jsx';
import MainMenu from '../main-menu/main-menu.jsx';
import ContactsPage from '../../pages/contacts/contacts-page.jsx';
import Footer from '../footer/footer.jsx';
import ShopPage from '../../pages/shop-page/shop-page.jsx';
import FaqPage from '../../pages/faq-page/faq-page.jsx';
import PricesPage from '../../pages/prices-page/prices-page.jsx';
import Constructor from '../../pages/constructor-page/constructor-page.jsx';



function App() {

const dispatch = useDispatch();
const { mainMenu } = useSelector(store => store.utilityState);


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
  console.log(e.target);
  dispatch({
    type: CLOSE_MODAL_MENU,
  })
}


  return (
    <> 
    {mainMenu.isVisible ? (<MainMenu closeMenu={closeMenu} />) : (<BurgerIcon openMenu={openMenu} />)}
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

      <Route exact path='/constructor'>
        <Constructor />
      </Route>



    </Switch>

    <Footer />
    </>

  
  );
}

export default App;
