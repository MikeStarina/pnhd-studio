"use client";
import React from "react";
import Link from "next/link";
import {
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
} from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";
import { ICategory } from "@/app/utils/types";

const AdminCategoriesList: React.FC = () => {
  const { data, isLoading, error } = useGetCategoriesQuery();
  const [deleteCategory, { isLoading: isDeleting, error: deleteError }] =
    useDeleteCategoryMutation();

  const categories = data?.data ?? [];

  const deleteHandler = async (item: ICategory) => {
    if (
      !window.confirm(
        `Удалить категорию «${item.label}»? Она будет убрана из всех товаров.`
      )
    )
      return;
    try {
      await deleteCategory(item._id).unwrap();
    } catch {
      /* error from mutation state */
    }
  };

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем категории...</p>;
  }

  if (error) {
    return <p className={styles.admin_error}>{getErrorMessage(error)}</p>;
  }

  return (
    <div>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>Категории</h1>
        <Link href="/profile/categories/new" className={styles.admin_button}>
          Создать
        </Link>
      </div>

      {deleteError && (
        <p className={styles.admin_error}>{getErrorMessage(deleteError)}</p>
      )}

      {categories.length === 0 ? (
        <p className={styles.admin_status}>Категорий пока нет.</p>
      ) : (
        <table className={styles.admin_table}>
          <thead>
            <tr>
              <th>Название</th>
              <th>Slug</th>
              <th>Порядок</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {categories.map((item) => (
              <tr key={item._id}>
                <td>
                  <Link
                    href={`/profile/categories/${item._id}`}
                    className={styles.admin_rowLink}
                  >
                    {item.label}
                  </Link>
                </td>
                <td>{item.slug}</td>
                <td>{item.order}</td>
                <td>
                  <div className={styles.admin_actions}>
                    <Link
                      href={`/profile/categories/${item._id}`}
                      className={styles.admin_buttonSecondary}
                    >
                      Изменить
                    </Link>
                    <button
                      type="button"
                      className={styles.admin_buttonDanger}
                      disabled={isDeleting}
                      onClick={() => deleteHandler(item)}
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

export default AdminCategoriesList;
