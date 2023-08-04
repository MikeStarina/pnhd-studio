import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CLOSE_MODAL_MENU } from '../../services/actions/utility-actions.jsx';
// import styles from './faq-page.module.css';

function FaqPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: CLOSE_MODAL_MENU,
    });
  }, [dispatch]);

  return (
    <main>
      <h1>faq page</h1>
    </main>
  );
}

export default FaqPage;
