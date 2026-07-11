"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import styles from "./auth.module.css";
import { textFieldSx, getErrorMessage } from "./auth-utils";
import { useAppDispatch } from "@/redux/redux-hooks";
import { actions as authActions } from "@/redux/auth-slice/auth.slice";
import { useForgotPasswordMutation } from "@/api/api";

const ForgotForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [forgotPassword, { isLoading, error }] = useForgotPasswordMutation();

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    try {
      await forgotPassword({ email: trimmedEmail }).unwrap();
      dispatch(authActions.setPendingEmail(trimmedEmail));
      router.push("/auth/reset");
    } catch {
      /* error is rendered from the mutation state */
    }
  };

  return (
    <form className={styles.auth_form} onSubmit={submitHandler}>
      <p className={styles.auth_title}>Восстановление пароля</p>
      <p className={styles.auth_subtitle}>
        Укажите почту — мы отправим код для сброса пароля.
      </p>
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
      {error && <p className={styles.auth_errorText}>{getErrorMessage(error)}</p>}
      <button
        type="submit"
        className={styles.auth_submitButton}
        disabled={isLoading}
      >
        {isLoading ? "Отправляем код..." : "Отправить код"}
      </button>
      <div className={styles.auth_linkRow}>
        <button
          type="button"
          className={styles.auth_linkButton}
          onClick={() => router.push("/auth/login")}
        >
          Назад ко входу
        </button>
      </div>
    </form>
  );
};

export default ForgotForm;
