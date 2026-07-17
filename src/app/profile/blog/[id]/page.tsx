"use client";
import React from "react";
import { useParams } from "next/navigation";
import AdminBlogForm from "@/components/shared-components/profile/admin-blog-form";
import { useGetBlogByIdQuery } from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";

const AdminBlogEditPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { data, isLoading, error } = useGetBlogByIdQuery(id, {
    skip: !id,
  });

  if (!id) {
    return <p className={styles.admin_error}>Некорректный id поста</p>;
  }

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем пост...</p>;
  }

  if (error || !data?.data) {
    return (
      <p className={styles.admin_error}>
        {getErrorMessage(error, "Пост не найден")}
      </p>
    );
  }

  return <AdminBlogForm mode="edit" post={data.data} />;
};

export default AdminBlogEditPage;
