import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CLOSE_MODAL_MENU } from '../../services/actions/utility-actions';
// import styles from './prices-page.module.css';

function PricesPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: CLOSE_MODAL_MENU,
    });
  }, [dispatch]);

  return (
    <main>
      <h1>prices page</h1>
    </main>
  );
}

export default PricesPage;
