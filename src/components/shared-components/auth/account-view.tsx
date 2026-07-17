"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import styles from "./auth.module.css";
import adminStyles from "@/app/profile/profile.module.css";
import { textFieldSx, getErrorMessage } from "./auth-utils";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as authActions } from "@/redux/auth-slice/auth.slice";
import {
  useLogoutMutation,
  useRequestChangePasswordMutation,
  useChangePasswordMutation,
} from "@/api/api";

const AccountView: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((store) => store.auth.user);
  const [isChanging, setIsChanging] = useState(false);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();
  const [requestChange, { isLoading: isRequesting }] =
    useRequestChangePasswordMutation();
  const [changePassword, { isLoading: isSaving, error }] =
    useChangePasswordMutation();

  const logoutHandler = async () => {
    try {
      await logout().unwrap();
    } catch {
      /* clear locally regardless */
    }
    dispatch(authActions.setUser(null));
    dispatch(authActions.resetAuthFlow());
    router.push("/");
  };

  const requestChangeHandler = async () => {
    setSuccessMessage("");
    try {
      await requestChange().unwrap();
      setIsChanging(true);
      setSuccessMessage("Код отправлен на вашу почту.");
    } catch {
      /* error rendered below */
    }
  };

  const changeSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    try {
      await changePassword({ code, newPassword }).unwrap();
      setIsChanging(false);
      setCode("");
      setNewPassword("");
      setSuccessMessage("Пароль успешно изменён.");
    } catch {
      /* error rendered below */
    }
  };

  if (!user) return null;

  return (
    <div>
      <h1 className={adminStyles.admin_title}>Профиль</h1>
      <p className={adminStyles.admin_status}>
        Данные аккаунта и смена пароля.
      </p>
      <p className={styles.auth_accountRow}>
        <span>Имя: </span>
        {user.name}
      </p>
      <p className={styles.auth_accountRow}>
        <span>Почта: </span>
        {user.email}
      </p>
      <p className={styles.auth_accountRow}>
        <span>Телефон: </span>
        {user.phone}
      </p>
      {user.role === "admin" && (
        <p className={styles.auth_accountRow}>
          <span>Роль: </span>
          администратор
        </p>
      )}

      {successMessage && (
        <p className={styles.auth_statusText}>{successMessage}</p>
      )}

      {!isChanging ? (
        <div className={adminStyles.admin_formActions}>
          <button
            type="button"
            className={styles.auth_submitButton}
            onClick={requestChangeHandler}
            disabled={isRequesting}
          >
            {isRequesting ? "Отправляем код..." : "Сменить пароль"}
          </button>
          <button
            type="button"
            className={styles.auth_linkButton}
            onClick={logoutHandler}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? "Выходим..." : "Выйти"}
          </button>
        </div>
      ) : (
        <form className={styles.auth_form} onSubmit={changeSubmitHandler}>
          <TextField
            label="Код из письма"
            required
            fullWidth
            size="small"
            autoComplete="one-time-code"
            inputProps={{ inputMode: "numeric", maxLength: 6 }}
            sx={textFieldSx}
            value={code}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setCode(e.target.value.replace(/\D/g, ""))
            }
          />
          <TextField
            type="password"
            label="Новый пароль (минимум 6 символов)"
            required
            fullWidth
            size="small"
            autoComplete="new-password"
            sx={textFieldSx}
            value={newPassword}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setNewPassword(e.target.value)
            }
          />
          {error && (
            <p className={styles.auth_errorText}>{getErrorMessage(error)}</p>
          )}
          <button
            type="submit"
            className={styles.auth_submitButton}
            disabled={isSaving || code.length !== 6 || newPassword.length < 6}
          >
            {isSaving ? "Сохраняем..." : "Сохранить пароль"}
          </button>
          <button
            type="button"
            className={styles.auth_linkButton}
            onClick={() => setIsChanging(false)}
          >
            Отмена
          </button>
        </form>
      )}
    </div>
  );
};

export default AccountView;
