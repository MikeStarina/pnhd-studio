"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import {
  useCreateCategoryMutation,
  useUpdateCategoryMutation,
} from "@/api/api";
import { ICategory, TCategoryInput } from "@/app/utils/types";
import {
  getErrorMessage,
  textFieldSx,
} from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";

const slugify = (value: string): string =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");

type FormState = {
  label: string;
  slug: string;
  order: string;
};

const emptyForm = (): FormState => ({ label: "", slug: "", order: "0" });

const categoryToForm = (category: ICategory): FormState => ({
  label: category.label ?? "",
  slug: category.slug ?? "",
  order: String(category.order ?? 0),
});

const formToPayload = (form: FormState): TCategoryInput => ({
  label: form.label.trim(),
  slug: slugify(form.slug || form.label),
  order: Number(form.order) || 0,
});

type AdminCategoryFormProps = {
  mode: "create" | "edit";
  category?: ICategory;
};

const AdminCategoryForm: React.FC<AdminCategoryFormProps> = ({
  mode,
  category,
}) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    category ? categoryToForm(category) : emptyForm()
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [createCategory, { isLoading: isCreating, error: createError }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating, error: updateError }] =
    useUpdateCategoryMutation();

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onLabelChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setForm((prev) => ({
      ...prev,
      label: value,
      slug: slugTouched ? prev.slug : slugify(value),
    }));
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    setFormError("");

    if (!form.label.trim()) {
      setFormError("Название обязательно");
      return;
    }
    if (!slugify(form.slug || form.label)) {
      setFormError("Slug обязателен");
      return;
    }

    const body = formToPayload(form);
    try {
      if (mode === "create") {
        const res = await createCategory(body).unwrap();
        router.push(`/profile/categories/${res.data._id}`);
        return;
      }
      if (!category?._id) return;
      await updateCategory({ id: category._id, body }).unwrap();
      setSuccessMessage("Сохранено.");
    } catch {
      /* error from mutation */
    }
  };

  const mutationError = createError || updateError;
  const isSaving = isCreating || isUpdating;

  return (
    <div>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>
          {mode === "create" ? "Новая категория" : "Редактирование категории"}
        </h1>
        <Link href="/profile/categories" className={styles.admin_buttonSecondary}>
          К списку
        </Link>
      </div>

      <form className={styles.admin_form} onSubmit={submitHandler}>
        <div className={styles.admin_formGrid}>
          <TextField
            label="Название"
            required
            fullWidth
            size="small"
            sx={textFieldSx}
            value={form.label}
            onChange={onLabelChange}
          />
          <TextField
            label="Slug"
            required
            fullWidth
            size="small"
            sx={textFieldSx}
            value={form.slug}
            helperText="Используется для URL/фильтров, латиницей"
            onChange={(e: ChangeEvent<HTMLInputElement>) => {
              setSlugTouched(true);
              setField("slug", e.target.value);
            }}
          />
          <TextField
            label="Порядок"
            type="number"
            fullWidth
            size="small"
            sx={textFieldSx}
            value={form.order}
            helperText="Меньше — раньше в списке"
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setField("order", e.target.value)
            }
          />
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
            disabled={isSaving}
          >
            {isSaving
              ? "Сохраняем..."
              : mode === "create"
                ? "Создать"
                : "Сохранить"}
          </button>
          <Link href="/profile/categories" className={styles.admin_buttonSecondary}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminCategoryForm;
