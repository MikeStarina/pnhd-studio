import React from "react";
import Link from "next/link";
import styles from "./admin.module.css";

export const metadata = { title: "Админ | PINHEAD STUDIO" };

const AdminPage = () => (
  <div>
    <h1 className={styles.admin_title}>Админ-панель</h1>
    <p className={styles.admin_status}>
      Управление каталогом и другими разделами студии.
    </p>
    <div className={styles.admin_actions}>
      <Link href="/admin/products" className={styles.admin_button}>
        Товары
      </Link>
      <Link href="/admin/banners" className={styles.admin_button}>
        Баннеры
      </Link>
    </div>
  </div>
);

export default AdminPage;
