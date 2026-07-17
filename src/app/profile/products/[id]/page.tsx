"use client";
import React from "react";
import { useParams } from "next/navigation";
import AdminProductForm from "@/components/shared-components/profile/admin-product-form";
import { useGetProductByIdQuery } from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";

const AdminProductEditPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { data, isLoading, error } = useGetProductByIdQuery(id, {
    skip: !id,
  });

  if (!id) {
    return <p className={styles.admin_error}>Некорректный id товара</p>;
  }

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем товар...</p>;
  }

  if (error || !data?.data) {
    return (
      <p className={styles.admin_error}>
        {getErrorMessage(error, "Товар не найден")}
      </p>
    );
  }

  return <AdminProductForm mode="edit" product={data.data} />;
};

export default AdminProductEditPage;
