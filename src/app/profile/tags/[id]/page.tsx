"use client";
import React from "react";
import { useParams } from "next/navigation";
import AdminTagForm from "@/components/shared-components/profile/admin-tag-form";
import { useGetTagByIdQuery } from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";

const AdminTagEditPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { data, isLoading, error } = useGetTagByIdQuery(id, {
    skip: !id,
  });

  if (!id) {
    return <p className={styles.admin_error}>Некорректный id тега</p>;
  }

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем тег...</p>;
  }

  if (error || !data?.data) {
    return (
      <p className={styles.admin_error}>
        {getErrorMessage(error, "Тег не найден")}
      </p>
    );
  }

  return <AdminTagForm mode="edit" tag={data.data} />;
};

export default AdminTagEditPage;
