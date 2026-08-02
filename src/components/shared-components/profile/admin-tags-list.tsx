"use client";
import React from "react";
import Link from "next/link";
import {
  useDeleteTagMutation,
  useGetTagsQuery,
} from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";
import { ITag } from "@/app/utils/types";

const AdminTagsList: React.FC = () => {
  const { data, isLoading, error } = useGetTagsQuery();
  const [deleteTag, { isLoading: isDeleting, error: deleteError }] =
    useDeleteTagMutation();

  const tags = data?.data ?? [];

  const deleteHandler = async (item: ITag) => {
    if (
      !window.confirm(
        `Удалить тег «${item.label}»? Он будет убран из всех товаров.`
      )
    )
      return;
    try {
      await deleteTag(item._id).unwrap();
    } catch {
      /* error from mutation state */
    }
  };

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем теги...</p>;
  }

  if (error) {
    return <p className={styles.admin_error}>{getErrorMessage(error)}</p>;
  }

  return (
    <div>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>Теги</h1>
        <Link href="/profile/tags/new" className={styles.admin_button}>
          Создать
        </Link>
      </div>

      {deleteError && (
        <p className={styles.admin_error}>{getErrorMessage(deleteError)}</p>
      )}

      {tags.length === 0 ? (
        <p className={styles.admin_status}>Тегов пока нет.</p>
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
            {tags.map((item) => (
              <tr key={item._id}>
                <td>
                  <Link
                    href={`/profile/tags/${item._id}`}
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
                      href={`/profile/tags/${item._id}`}
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

export default AdminTagsList;
