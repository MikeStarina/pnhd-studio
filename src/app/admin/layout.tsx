"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthGuard from "@/components/shared-components/auth/auth-guard";
import styles from "./admin.module.css";

export default function AdminLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();

  return (
    <AuthGuard requireAdmin>
      <section className={styles.admin_shell}>
        <aside className={styles.admin_nav}>
          <p className={styles.admin_navTitle}>Админ</p>
          <Link
            href="/admin"
            className={
              pathname === "/admin"
                ? styles.admin_navLinkActive
                : styles.admin_navLink
            }
          >
            Главная
          </Link>
          <Link
            href="/admin/products"
            className={
              pathname?.startsWith("/admin/products")
                ? styles.admin_navLinkActive
                : styles.admin_navLink
            }
          >
            Товары
          </Link>
          <Link
            href="/admin/banners"
            className={
              pathname?.startsWith("/admin/banners")
                ? styles.admin_navLinkActive
                : styles.admin_navLink
            }
          >
            Баннеры
          </Link>
        </aside>
        <div className={styles.admin_content}>{children}</div>
      </section>
    </AuthGuard>
  );
}
