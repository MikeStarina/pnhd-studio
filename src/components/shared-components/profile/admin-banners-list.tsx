"use client";
import React from "react";
import Link from "next/link";
import {
  useDeleteBannerMutation,
  useGetAdminBannersQuery,
} from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";
import { IBanner } from "@/app/utils/types";

const AdminBannersList: React.FC = () => {
  const { data, isLoading, error } = useGetAdminBannersQuery();
  const [deleteBanner, { isLoading: isDeleting, error: deleteError }] =
    useDeleteBannerMutation();

  const banners = data?.data ?? [];

  const deleteHandler = async (banner: IBanner) => {
    if (!window.confirm("Удалить этот баннер?")) return;
    try {
      await deleteBanner(banner._id).unwrap();
    } catch {
      /* error from mutation state */
    }
  };

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем баннеры...</p>;
  }

  if (error) {
    return (
      <p className={styles.admin_error}>{getErrorMessage(error)}</p>
    );
  }

  return (
    <div>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>Баннеры</h1>
        <Link href="/profile/banners/new" className={styles.admin_button}>
          Создать
        </Link>
      </div>

      {deleteError && (
        <p className={styles.admin_error}>{getErrorMessage(deleteError)}</p>
      )}

      {banners.length === 0 ? (
        <p className={styles.admin_status}>Баннеров пока нет.</p>
      ) : (
        <table className={styles.admin_table}>
          <thead>
            <tr>
              <th>Desktop</th>
              <th>Mobile</th>
              <th>Ссылка</th>
              <th>Порядок</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {banners.map((banner) => (
              <tr key={banner._id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.admin_thumb}
                    src={banner.imageUrl}
                    alt=""
                  />
                </td>
                <td>
                  {banner.mobileImageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      className={styles.admin_thumb}
                      src={banner.mobileImageUrl}
                      alt=""
                    />
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  <Link
                    href={`/profile/banners/${banner._id}`}
                    className={styles.admin_rowLink}
                  >
                    {banner.link}
                  </Link>
                </td>
                <td>{banner.order}</td>
                <td>
                  <span
                    className={
                      banner.isActive
                        ? styles.admin_badgeOn
                        : styles.admin_badgeOff
                    }
                  >
                    {banner.isActive ? "Вкл" : "Выкл"}
                  </span>
                </td>
                <td>
                  <div className={styles.admin_actions}>
                    <Link
                      href={`/profile/banners/${banner._id}`}
                      className={styles.admin_buttonSecondary}
                    >
                      Изменить
                    </Link>
                    <button
                      type="button"
                      className={styles.admin_buttonDanger}
                      disabled={isDeleting}
                      onClick={() => deleteHandler(banner)}
                    >
                      Удалить
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default AdminBannersList;
