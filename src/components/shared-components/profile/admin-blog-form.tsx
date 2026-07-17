"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import {
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useUploadBlogCoverMutation,
} from "@/api/api";
import { IBlogPost, TBlogPostInput } from "@/app/utils/types";
import {
  getErrorMessage,
  textFieldSx,
} from "@/components/shared-components/auth/auth-utils";
import { revalidateBlogData } from "@/app/utils/server-actions";
import styles from "@/app/profile/profile.module.css";
import AdminBlogEditor from "./admin-blog-editor";

type FormState = {
  title: string;
  subtitle: string;
  slug: string;
  cover: string;
  hashtags: string;
  author: string;
  html: string;
  isActive: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  subtitle: "",
  slug: "",
  cover: "",
  hashtags: "",
  author: "",
  html: "<p></p>",
  isActive: true,
});

const postToForm = (post: IBlogPost): FormState => ({
  title: post.title ?? "",
  subtitle: post.subtitle ?? "",
  slug: post.slug ?? "",
  cover: post.cover ?? "",
  hashtags: (post.hashtags ?? []).join(", "),
  author: post.author ?? "",
  html: post.blog?.__html ?? "<p></p>",
  isActive: post.isActive !== false,
});

const formToPayload = (form: FormState): TBlogPostInput => ({
  title: form.title.trim(),
  subtitle: form.subtitle.trim(),
  slug: form.slug.trim(),
  cover: form.cover.trim(),
  hashtags: form.hashtags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean),
  author: form.author.trim(),
  blog: { __html: form.html },
  isActive: form.isActive,
});

type AdminBlogFormProps = {
  mode: "create" | "edit";
  post?: IBlogPost;
};

const AdminBlogForm: React.FC<AdminBlogFormProps> = ({ mode, post }) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    post ? postToForm(post) : emptyForm()
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");

  const [createBlog, { isLoading: isCreating, error: createError }] =
    useCreateBlogMutation();
  const [updateBlog, { isLoading: isUpdating, error: updateError }] =
    useUpdateBlogMutation();
  const [uploadBlogCover, { isLoading: isUploading, error: uploadError }] =
    useUploadBlogCoverMutation();

  useEffect(() => {
    if (post) setForm(postToForm(post));
  }, [post]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const onCoverChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setFormError("");
    const data = new FormData();
    data.append("files", file);
    try {
      const res = await uploadBlogCover(data).unwrap();
      const url = res.data?.url;
      if (url) setField("cover", url);
      else setFormError("Сервер не вернул URL обложки");
    } catch {
      /* error from mutation */
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    setFormError("");

    if (!form.title.trim()) {
      setFormError("Укажите название");
      return;
    }
    if (!form.slug.trim()) {
      setFormError("Укажите slug");
      return;
    }
    if (!form.cover.trim()) {
      setFormError("Загрузите обложку");
      return;
    }
    const plain = form.html.replace(/<[^>]*>/g, "").trim();
    if (!plain) {
      setFormError("Добавьте текст поста");
      return;
    }

    const body = formToPayload(form);
    try {
      if (mode === "create") {
        const res = await createBlog(body).unwrap();
        await revalidateBlogData(body.slug);
        router.push(`/profile/blog/${res.data._id}`);
        return;
      }
      if (!post?._id) return;
      await updateBlog({ id: post._id, body }).unwrap();
      await revalidateBlogData(body.slug, post.slug);
      setSuccessMessage("Сохранено.");
    } catch {
      /* error from mutation */
    }
  };

  const mutationError = createError || updateError || uploadError;
  const isSaving = isCreating || isUpdating;

  return (
    <div>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>
          {mode === "create" ? "Новый пост" : "Редактирование поста"}
        </h1>
        <Link href="/profile/blog" className={styles.admin_buttonSecondary}>
          К списку
        </Link>
      </div>

      <form className={styles.admin_form} onSubmit={submitHandler}>
        <div className={styles.admin_formSection}>
          <p className={styles.admin_formSectionTitle}>Обложка</p>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className={styles.admin_fileInput}
            disabled={isUploading || isSaving}
            onChange={onCoverChange}
          />
          {isUploading && (
            <p className={styles.admin_status}>Загружаем в хранилище...</p>
          )}
          {form.cover ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              className={styles.admin_bannerPreview}
              src={form.cover}
              alt="Обложка"
            />
          ) : (
            <p className={styles.admin_status}>Обложка ещё не загружена</p>
          )}
        </div>

        <div className={styles.admin_formGrid}>
          <TextField
            label="Название"
            value={form.title}
            onChange={(e) => setField("title", e.target.value)}
            fullWidth
            required
            sx={textFieldSx}
          />
          <TextField
            label="Slug"
            value={form.slug}
            onChange={(e) => setField("slug", e.target.value)}
            fullWidth
            required
            helperText="URL: /blog/slug"
            sx={textFieldSx}
          />
        </div>

        <TextField
          label="Подзаголовок"
          value={form.subtitle}
          onChange={(e) => setField("subtitle", e.target.value)}
          fullWidth
          sx={textFieldSx}
        />

        <div className={styles.admin_formGrid}>
          <TextField
            label="Автор"
            value={form.author}
            onChange={(e) => setField("author", e.target.value)}
            fullWidth
            sx={textFieldSx}
          />
          <TextField
            label="Хэштеги"
            value={form.hashtags}
            onChange={(e) => setField("hashtags", e.target.value)}
            fullWidth
            helperText="Через запятую"
            sx={textFieldSx}
          />
        </div>

        <div className={styles.admin_formSection}>
          <p className={styles.admin_formSectionTitle}>Текст</p>
          <AdminBlogEditor
            value={form.html}
            onChange={(html) => setField("html", html)}
            disabled={isSaving}
          />
        </div>

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
          <Link href="/profile/blog" className={styles.admin_buttonSecondary}>
            Отмена
          </Link>
        </div>
      </form>
    </div>
  );
};

export default AdminBlogForm;
