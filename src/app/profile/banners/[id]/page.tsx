"use client";
import React from "react";
import { useParams } from "next/navigation";
import AdminBannerForm from "@/components/shared-components/profile/admin-banner-form";
import { useGetBannerByIdQuery } from "@/api/api";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";

const AdminBannerEditPage = () => {
  const params = useParams();
  const id = typeof params?.id === "string" ? params.id : "";
  const { data, isLoading, error } = useGetBannerByIdQuery(id, {
    skip: !id,
  });

  if (!id) {
    return <p className={styles.admin_error}>Некорректный id баннера</p>;
  }

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем баннер...</p>;
  }

  if (error || !data?.data) {
    return (
      <p className={styles.admin_error}>
        {getErrorMessage(error, "Баннер не найден")}
      </p>
    );
  }

  return <AdminBannerForm mode="edit" banner={data.data} />;
};

export default AdminBannerEditPage;
