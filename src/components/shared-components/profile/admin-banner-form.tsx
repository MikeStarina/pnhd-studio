"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useUploadBannerImageMutation,
} from "@/api/api";
import { IBanner, TBannerInput } from "@/app/utils/types";
import {
  getErrorMessage,
  textFieldSx,
} from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";

type FormState = {
  imageUrl: string;
  mobileImageUrl: string;
  link: string;
  order: string;
  isActive: boolean;
};

type ImageField = "imageUrl" | "mobileImageUrl";

const emptyForm = (): FormState => ({
  imageUrl: "",
  mobileImageUrl: "",
  link: "",
  order: "0",
  isActive: true,
});

const bannerToForm = (banner: IBanner): FormState => ({
  imageUrl: banner.imageUrl ?? "",
  mobileImageUrl: banner.mobileImageUrl ?? "",
  link: banner.link ?? "",
  order: String(banner.order ?? 0),
  isActive: banner.isActive !== false,
});

const formToPayload = (form: FormState): TBannerInput => ({
  imageUrl: form.imageUrl.trim(),
  mobileImageUrl: form.mobileImageUrl.trim(),
  link: form.link.trim(),
  order: Number(form.order) || 0,
  isActive: form.isActive,
});

type AdminBannerFormProps = {
  mode: "create" | "edit";
  banner?: IBanner;
};

const AdminBannerForm: React.FC<AdminBannerFormProps> = ({ mode, banner }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    banner ? bannerToForm(banner) : emptyForm()
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [uploadingField, setUploadingField] = useState<ImageField | null>(null);

  const [createBanner, { isLoading: isCreating, error: createError }] =
    useCreateBannerMutation();
  const [updateBanner, { isLoading: isUpdating, error: updateError }] =
    useUpdateBannerMutation();
  const [uploadBannerImage, { isLoading: isUploading, error: uploadError }] =
    useUploadBannerImageMutation();

  useEffect(() => {
    if (banner) setForm(bannerToForm(banner));
  }, [banner]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    field: ImageField
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setFormError("");
    setUploadingField(field);
    const data = new FormData();
    data.append("files", file);
    try {
      const res = await uploadBannerImage(data).unwrap();
      const url = res.data?.url;
      if (url) setField(field, url);
      else setFormError("Сервер не вернул URL изображения");
    } catch {
      /* error from mutation */
    } finally {
      setUploadingField(null);
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    setFormError("");

    if (!form.imageUrl.trim()) {
      setFormError("Загрузите desktop-изображение");
      return;
    }
    if (!form.mobileImageUrl.trim()) {
      setFormError("Загрузите mobile-изображение");
      return;
    }
    if (!form.link.trim()) {
      setFormError("Укажите ссылку");
      return;
    }
    if (!Number.isFinite(Number(form.order))) {
      setFormError("Порядок должен быть числом");
      return;
    }

    const body = formToPayload(form);
    try {
      if (mode === "create") {
        const res = await createBanner(body).unwrap();
        router.push(`/profile/banners/${res.data._id}`);
        return;
      }
      if (!banner?._id) return;
      await updateBanner({ id: banner._id, body }).unwrap();
      setSuccessMessage("Сохранено.");
    } catch {
      /* error from mutation */
    }
  };

  const mutationError = createError || updateError || uploadError;
  const isSaving = isCreating || isUpdating;

  const renderImageSection = (
    title: string,
    field: ImageField,
    emptyLabel: string
  ) => (
    <div className={styles.admin_formSection}>
      <p className={styles.admin_formSectionTitle}>{title}</p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className={styles.admin_fileInput}
        disabled={isUploading || isSaving}
        onChange={(e) => onFileChange(e, field)}
      />
      {uploadingField === field && (
        <p className={styles.admin_status}>Загружаем в хранилище...</p>
      )}
      {form[field] ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className={styles.admin_bannerPreview}
          src={form[field]}
          alt={`Превью ${title}`}
        />
      ) : (
        <p className={styles.admin_status}>{emptyLabel}</p>
      )}
    </div>
  );

  return (
    <div>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>
          {mode === "create" ? "Новый баннер" : "Редактирование баннера"}
        </h1>
        <Link href="/profile/banners" className={styles.admin_buttonSecondary}>
          К списку
        </Link>
      </div>

      <form className={styles.admin_form} onSubmit={submitHandler}>
        {renderImageSection(
          "Desktop",
          "imageUrl",
          "Desktop-изображение ещё не загружено"
        )}
        {renderImageSection(
          "Mobile",
          "mobileImageUrl",
          "Mobile-изображение ещё не загружено"
        )}

        <TextField
          label="Ссылка"
          value={form.link}
          onChange={(e) => setField("link", e.target.value)}
          fullWidth
          required
          placeholder="/shop или https://..."
          sx={textFieldSx}
        />

        <div className={styles.admin_formGrid}>
          <TextField
            label="Порядок"
            type="number"
            value={form.order}
            onChange={(e) => setField("order", e.target.value)}
            fullWidth
            required
            helperText="Меньше — раньше в карусели"
            sx={textFieldSx}
          />
          <div className={styles.admin_checks}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={form.isActive}
                  onChange={(e) => setField("isActive", e.target.checked)}
                />
              }
              label="Активен"
            />
          </div>
        </div>

        {formError && <p className={styles.admin_error}>{formError}</p>}
        {mutationError && (
          <p className={styles.admin_error}>{getErrorMessage(mutationError)}</p>
        )}
        {successMessage && (
          <p className={styles.admin_status}>{successMessage}</p>
        )}

        <div className={styles.admin_formActions}>
          <button
            type="submit"
            className={styles.admin_button}
            disabled={isSaving || isUploading}
          >
            {isSaving ? "Сохраняем..." : "Сохранить"}
          </button>
          <Link href="/profile/banners" className={styles.admin_buttonSecondary}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminBannerForm;
