import React from 'react';
//import styles from './app.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { OPEN_MODAL_MENU, CLOSE_MODAL_MENU } from '../../services/actions/utility-actions';
import { Route, Switch } from 'react-router-dom';
import MainPage from '../../pages/main-page/main-page.jsx';
import BurgerIcon from '../main-menu/burger-icon.jsx';
import MainMenu from '../main-menu/main-menu.jsx';
import ContactsPage from '../../pages/contacts/contacts-page.jsx';


function App() {

const dispatch = useDispatch();
const { mainMenu } = useSelector(store => store.utilityState);


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

    </Switch>
    </>

  
  );
}

export default App;
