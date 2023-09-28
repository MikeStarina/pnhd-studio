import React from 'react';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { CLOSE_MODAL_MENU } from '../../services/actions/utility-actions';

function ContactsPage() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: CLOSE_MODAL_MENU,
    });
  }, [dispatch]);

  return (
    <main>
      <h1>contacts page</h1>
    </main>
  );
}

export default ContactsPage;
