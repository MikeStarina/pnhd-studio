"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/redux-hooks";
import { useGetMeQuery } from "@/api/api";
import styles from "@/app/profile/profile.module.css";

const AccountShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const reduxUser = useAppSelector((store) => store.auth.user);
  const { data } = useGetMeQuery();
  const user = reduxUser ?? data?.user ?? null;
  const isAdmin = user?.role === "admin";

  const profileActive = pathname === "/profile" || pathname === "/profile/";

  return (
    <section className={styles.admin_shell}>
      <aside className={styles.admin_nav}>
        <p className={styles.admin_navTitle}>Кабинет</p>
        <Link
          href="/profile"
          className={
            profileActive ? styles.admin_navLinkActive : styles.admin_navLink
          }
        >
          Профиль
        </Link>
        {isAdmin && (
          <>
            <Link
              href="/profile/products"
              className={
                pathname?.startsWith("/profile/products")
                  ? styles.admin_navLinkActive
                  : styles.admin_navLink
              }
            >
              Товары
            </Link>
            <Link
              href="/profile/banners"
              className={
                pathname?.startsWith("/profile/banners")
                  ? styles.admin_navLinkActive
                  : styles.admin_navLink
              }
            >
              Баннеры
            </Link>
            <Link
              href="/profile/blog"
              className={
                pathname?.startsWith("/profile/blog")
                  ? styles.admin_navLinkActive
                  : styles.admin_navLink
              }
            >
              Блог
            </Link>
          </>
        )}
      </aside>
      <div className={styles.admin_content}>{children}</div>
    </section>
  );
};

export default AccountShell;
