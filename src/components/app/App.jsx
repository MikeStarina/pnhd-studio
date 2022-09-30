import React from 'react';
import './app.module.css';

import MainPage from '../../pages/main-page/main-page.jsx';
import MainMenu from '../main-menu/main-menu.jsx';

function App() {
  return (
    <>
      <MainMenu />
      <MainPage />
    </>
  );
}

export default App;
