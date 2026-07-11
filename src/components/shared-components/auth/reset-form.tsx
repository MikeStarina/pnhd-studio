"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import styles from "./auth.module.css";
import { textFieldSx, getErrorMessage } from "./auth-utils";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as authActions } from "@/redux/auth-slice/auth.slice";
import { useResetPasswordMutation, useResendOtpMutation } from "@/api/api";

const RESEND_COOLDOWN = 60;

const ResetForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const pendingEmail = useAppSelector((store) => store.auth.pendingEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [resetPassword, { isLoading, error }] = useResetPasswordMutation();
  const [resendOtp, { isLoading: isResending }] = useResendOtpMutation();

  useEffect(() => {
    if (!pendingEmail) router.replace("/auth/forgot");
  }, [pendingEmail, router]);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => setCooldown((c) => c - 1), 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await resetPassword({
        email: pendingEmail,
        code,
        newPassword,
      }).unwrap();
      dispatch(authActions.setUser(res.user));
      dispatch(authActions.resetAuthFlow());
      router.push("/auth/account");
    } catch {
      /* error is rendered from the mutation state */
    }
  };

  const resendHandler = async () => {
    try {
      await resendOtp({ email: pendingEmail, purpose: "reset" }).unwrap();
      setCooldown(RESEND_COOLDOWN);
    } catch {
      /* ignore */
    }
  };

  return (
    <form className={styles.auth_form} onSubmit={submitHandler}>
      <p className={styles.auth_title}>Новый пароль</p>
      <p className={styles.auth_subtitle}>
        Введите код из письма ({pendingEmail}) и новый пароль.
      </p>
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
      {error && <p className={styles.auth_errorText}>{getErrorMessage(error)}</p>}
      <button
        type="submit"
        className={styles.auth_submitButton}
        disabled={isLoading || code.length !== 6 || newPassword.length < 6}
      >
        {isLoading ? "Сохраняем..." : "Сохранить пароль"}
      </button>
      <div className={styles.auth_linkRow}>
        <button
          type="button"
          className={styles.auth_linkButton}
          onClick={resendHandler}
          disabled={cooldown > 0 || isResending}
        >
          {cooldown > 0
            ? `Отправить код повторно (${cooldown})`
            : "Отправить код повторно"}
        </button>
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

export default ResetForm;
