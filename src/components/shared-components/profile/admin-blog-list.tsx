"use client";
import React from "react";
import Link from "next/link";
import {
  useDeleteBlogMutation,
  useGetAdminBlogsQuery,
} from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";
import { IBlogPost } from "@/app/utils/types";
import { revalidateBlogData } from "@/app/utils/server-actions";

const AdminBlogList: React.FC = () => {
  const { data, isLoading, error } = useGetAdminBlogsQuery();
  const [deleteBlog, { isLoading: isDeleting, error: deleteError }] =
    useDeleteBlogMutation();

  const posts = data?.data ?? [];

  const deleteHandler = async (post: IBlogPost) => {
    if (!window.confirm(`Удалить пост «${post.title}»?`)) return;
    try {
      await deleteBlog(post._id).unwrap();
      await revalidateBlogData(post.slug);
    } catch {
      /* error from mutation state */
    }
  };

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем посты...</p>;
  }

  if (error) {
    return <p className={styles.admin_error}>{getErrorMessage(error)}</p>;
  }

  return (
    <div>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>Блог</h1>
        <Link href="/profile/blog/new" className={styles.admin_button}>
          Создать
        </Link>
      </div>

      {deleteError && (
        <p className={styles.admin_error}>{getErrorMessage(deleteError)}</p>
      )}

      {posts.length === 0 ? (
        <p className={styles.admin_status}>Постов пока нет.</p>
      ) : (
        <table className={styles.admin_table}>
          <thead>
            <tr>
              <th>Обложка</th>
              <th>Название</th>
              <th>Slug</th>
              <th>Дата</th>
              <th>Статус</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post._id}>
                <td>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    className={styles.admin_thumb}
                    src={post.cover}
                    alt=""
                  />
                </td>
                <td>
                  <Link
                    href={`/profile/blog/${post._id}`}
                    className={styles.admin_rowLink}
                  >
                    {post.title}
                  </Link>
                </td>
                <td>{post.slug}</td>
                <td>{post.createdAt}</td>
                <td>
                  <span
                    className={
                      post.isActive !== false
                        ? styles.admin_badgeOn
                        : styles.admin_badgeOff
                    }
                  >
                    {post.isActive !== false ? "Вкл" : "Выкл"}
                  </span>
                </td>
                <td>
                  <div className={styles.admin_actions}>
                    <Link
                      href={`/profile/blog/${post._id}`}
                      className={styles.admin_buttonSecondary}
                    >
                      Изменить
                    </Link>
                    <button
                      type="button"
                      className={styles.admin_buttonDanger}
                      disabled={isDeleting}
                      onClick={() => deleteHandler(post)}
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

export default AdminBlogList;
