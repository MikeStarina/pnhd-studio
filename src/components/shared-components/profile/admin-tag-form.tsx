"use client";
import React, { ChangeEvent, FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import {
  useCreateTagMutation,
  useUpdateTagMutation,
} from "@/api/api";
import { ITag, TTagInput } from "@/app/utils/types";
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

const tagToForm = (tag: ITag): FormState => ({
  label: tag.label ?? "",
  slug: tag.slug ?? "",
  order: String(tag.order ?? 0),
});

const formToPayload = (form: FormState): TTagInput => ({
  label: form.label.trim(),
  slug: slugify(form.slug || form.label),
  order: Number(form.order) || 0,
});

type AdminTagFormProps = {
  mode: "create" | "edit";
  tag?: ITag;
};

const AdminTagForm: React.FC<AdminTagFormProps> = ({ mode, tag }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    tag ? tagToForm(tag) : emptyForm()
  );
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [createTag, { isLoading: isCreating, error: createError }] =
    useCreateTagMutation();
  const [updateTag, { isLoading: isUpdating, error: updateError }] =
    useUpdateTagMutation();

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
        const res = await createTag(body).unwrap();
        router.push(`/profile/tags/${res.data._id}`);
        return;
      }
      if (!tag?._id) return;
      await updateTag({ id: tag._id, body }).unwrap();
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
          {mode === "create" ? "Новый тег" : "Редактирование тега"}
        </h1>
        <Link href="/profile/tags" className={styles.admin_buttonSecondary}>
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
          <Link href="/profile/tags" className={styles.admin_buttonSecondary}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminTagForm;
