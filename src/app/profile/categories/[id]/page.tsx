"use client";
import React from "react";
import { useParams } from "next/navigation";
import AdminCategoryForm from "@/components/shared-components/profile/admin-category-form";
import { useGetCategoryByIdQuery } from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";

const AdminCategoryEditPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { data, isLoading, error } = useGetCategoryByIdQuery(id, {
    skip: !id,
  });

  if (!id) {
    return <p className={styles.admin_error}>Некорректный id категории</p>;
  }

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем категорию...</p>;
  }

  if (error || !data?.data) {
    return (
      <p className={styles.admin_error}>
        {getErrorMessage(error, "Категория не найдена")}
      </p>
    );
  }

  return <AdminCategoryForm mode="edit" category={data.data} />;
};

export default AdminCategoryEditPage;
