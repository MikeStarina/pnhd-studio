"use client";
import React from "react";
import styles from "./auth-button.module.css";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as utilsActions } from "@/redux/utils-slice/utils.slice";
import { actions as authActions } from "@/redux/auth-slice/auth.slice";

const AuthButton: React.FC = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((store) => store.auth.user);

  const clickHandler = () => {
    if (!user) {
      dispatch(authActions.setAuthStep("login"));
    }
    dispatch(utilsActions.setPopupTitle(""));
    dispatch(utilsActions.setPopupType("auth"));
    dispatch(utilsActions.setPopupVisibility());
  };

  return (
    <button
      type="button"
      className={styles.authButton}
      onClick={clickHandler}
    >
      {user ? user.name || "Аккаунт" : "Войти"}
    </button>
  );
};

export default AuthButton;
