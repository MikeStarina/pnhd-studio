import React from "react";
import styles from "./auth-layout.module.css";

export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <section className={styles.auth_screen}>
      <div className={styles.auth_card}>{children}</div>
    </section>
  );
}
