"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import { MuiTelInput } from "mui-tel-input";
import Image from "next/image";
import styles from "./auth.module.css";
import { textFieldSx, getErrorMessage } from "./auth-utils";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as authActions } from "@/redux/auth-slice/auth.slice";
import { useRegisterMutation } from "@/api/api";
import RU_FLAG from "../../../../public/ru_flag.webp";

const RegisterForm: React.FC = () => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((store) => store.auth.user);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [register, { isLoading, error }] = useRegisterMutation();

  useEffect(() => {
    if (user) router.replace("/auth/account");
  }, [user, router]);

  const isValid =
    email.trim() !== "" &&
    name.trim() !== "" &&
    phone.trim() !== "" &&
    password.length >= 6;

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    try {
      await register({
        email: trimmedEmail,
        name: name.trim(),
        phone: phone.replaceAll(" ", ""),
        password,
      }).unwrap();
      dispatch(authActions.setPendingEmail(trimmedEmail));
      router.push("/auth/verify");
    } catch {
      /* error is rendered from the mutation state */
    }
  };

  return (
    <form className={styles.auth_form} onSubmit={submitHandler}>
      <p className={styles.auth_title}>Регистрация</p>
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
        label="Имя"
        required
        fullWidth
        size="small"
        autoComplete="name"
        sx={textFieldSx}
        value={name}
        onChange={(e: ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
      />
      <MuiTelInput
        onlyCountries={["RU"]}
        label="Телефон"
        required
        fullWidth
        size="small"
        autoComplete="off"
        defaultCountry="RU"
        disableDropdown
        sx={textFieldSx}
        value={phone}
        onChange={(newValue: string) => setPhone(newValue)}
        getFlagElement={() => (
          <Image
            width={26}
            height={17}
            alt="Россия"
            src={RU_FLAG}
            aria-label="Россия"
          />
        )}
      />
      <TextField
        type="password"
        label="Пароль (минимум 6 символов)"
        required
        fullWidth
        size="small"
        autoComplete="new-password"
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
        disabled={isLoading || !isValid}
      >
        {isLoading ? "Отправляем код..." : "Зарегистрироваться"}
      </button>
      <div className={styles.auth_linkRow}>
        <button
          type="button"
          className={styles.auth_linkButton}
          onClick={() => router.push("/auth/login")}
        >
          Уже есть аккаунт? Войти
        </button>
      </div>
    </form>
  );
};

export default RegisterForm;
