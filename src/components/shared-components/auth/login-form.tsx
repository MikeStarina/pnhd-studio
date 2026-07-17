"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import styles from "./auth.module.css";
import { textFieldSx, getErrorMessage, getPostAuthPath } from "./auth-utils";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as authActions } from "@/redux/auth-slice/auth.slice";
import { useLoginMutation } from "@/api/api";

const LoginForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((store) => store.auth.user);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [login, { isLoading, error }] = useLoginMutation();

  useEffect(() => {
    if (user) router.replace(getPostAuthPath(user));
  }, [user, router]);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await login({ email: email.trim(), password }).unwrap();
      dispatch(authActions.setUser(res.user));
      router.push(getPostAuthPath(res.user));
    } catch {
      /* error is rendered from the mutation state */
    }
  };

  return (
    <form className={styles.auth_form} onSubmit={submitHandler}>
      <p className={styles.auth_title}>Вход</p>
      <TextField
        type="email"
        label="Почта"
        required
        fullWidth
        size="small"
        autoComplete="email"
        sx={textFieldSx}
        value={email}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
      />
      <TextField
        type="password"
        label="Пароль"
        required
        fullWidth
        size="small"
        autoComplete="current-password"
        sx={textFieldSx}
        value={password}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setPassword(e.target.value)
        }
      />
      {error && <p className={styles.auth_errorText}>{getErrorMessage(error)}</p>}
      <button
        type="submit"
        className={styles.auth_submitButton}
        disabled={isLoading}
      >
        {isLoading ? "Входим..." : "Войти"}
      </button>
      <div className={styles.auth_linkRow}>
        <button
          type="button"
          className={styles.auth_linkButton}
          onClick={() => router.push("/auth/register")}
        >
          Регистрация
        </button>
        <button
          type="button"
          className={styles.auth_linkButton}
          onClick={() => router.push("/auth/forgot")}
        >
          Забыли пароль?
        </button>
      </div>
    </form>
  );
};

export default LoginForm;
