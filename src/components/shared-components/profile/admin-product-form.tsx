"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import ListItemText from "@mui/material/ListItemText";
import Link from "next/link";
import {
  useCreateProductMutation,
  useDeleteProductPhotoMutation,
  useGetCategoriesQuery,
  useGetTagsQuery,
  useUpdateProductMutation,
  useUploadProductPhotoMutation,
} from "@/api/api";
import { IProduct, TProductInput } from "@/app/utils/types";
import { toCategoryArray } from "@/app/utils/product-categories";
import { toTagArray } from "@/app/utils/product-tags";
import {
  getErrorMessage,
  textFieldSx,
} from "@/components/shared-components/auth/auth-utils";
import { revalidateShopData } from "@/app/utils/server-actions";
import styles from "@/app/profile/profile.module.css";

const PRODUCT_TYPES = [
  { label: "Футболка", value: "tshirt" },
  { label: "Лонгслив", value: "longsleeve" },
  { label: "Свитшот", value: "sweatshirt" },
  { label: "Худи", value: "hoodie" },
  { label: "Шоппер", value: "totebag" },
  { label: "Кепка", value: "cap" },
];

type FormState = {
  slug: string;
  name: string;
  oneCCode: string;
  description: string;
  links: string[];
  type: string;
  price: string;
  shippingParams: {
    weight: string;
    width: string;
    length: string;
    depth: string;
  };
  stock: string;
  color: string;
  category: string[];
  tags: string[];
  isForPrinting: boolean;
  image_url: string;
  galleryPhotos: string[];
  photos: string[];
  editor_front_view: string;
  editor_back_view: string;
  editor_lsleeve_view: string;
  editor_rsleeve_view: string;
  sizes: Array<{ name: string; qty: string }>;
  friends: string;
};

const EDITOR_VIEWS = [
  ["editor_front_view", "Перед"],
  ["editor_back_view", "Спина"],
  ["editor_lsleeve_view", "Левый рукав"],
  ["editor_rsleeve_view", "Правый рукав"],
] as const;

const emptyForm = (): FormState => ({
  slug: "",
  name: "",
  oneCCode: "",
  description: "",
  links: [],
  type: "tshirt",
  price: "",
  shippingParams: { weight: "", width: "", length: "", depth: "" },
  stock: "studio",
  color: "",
  category: [],
  tags: [],
  isForPrinting: true,
  image_url: "",
  galleryPhotos: [],
  photos: [],
  editor_front_view: "",
  editor_back_view: "",
  editor_lsleeve_view: "",
  editor_rsleeve_view: "",
  sizes: [{ name: "", qty: "0" }],
  friends: "",
});

const productToForm = (product: IProduct): FormState => ({
  slug: product.slug ?? "",
  name: product.name ?? "",
  oneCCode: product.oneCCode ?? "",
  description: product.description ?? "",
  links: product.links?.length ? [...product.links] : [],
  type: product.type ?? "tshirt",
  price: String(product.price ?? ""),
  shippingParams: {
    weight: String(product.shippingParams?.weight ?? ""),
    width: String(product.shippingParams?.width ?? ""),
    length: String(product.shippingParams?.length ?? ""),
    depth: String(product.shippingParams?.depth ?? ""),
  },
  stock: product.stock ?? "studio",
  color: product.color ?? "",
  category: toCategoryArray(product.category),
  tags: toTagArray(product.tags),
  isForPrinting: product.isForPrinting !== false,
  image_url: product.image_url ?? "",
  galleryPhotos: product.galleryPhotos?.length
    ? [...product.galleryPhotos]
    : [],
  photos: product.photos?.length ? [...product.photos] : [],
  editor_front_view: product.editor_front_view ?? "",
  editor_back_view: product.editor_back_view ?? "",
  editor_lsleeve_view: product.editor_lsleeve_view ?? "",
  editor_rsleeve_view: product.editor_rsleeve_view ?? "",
  sizes: product.sizes?.length
    ? product.sizes.map((s) => ({
        name: s.name ?? "",
        qty: String(s.qty ?? 0),
      }))
    : [{ name: "", qty: "0" }],
  friends: product.friends ?? "",
});

const formToPayload = (form: FormState): TProductInput => {
  const toNum = (v: string) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

  return {
    slug: form.slug.trim(),
    name: form.name.trim(),
    oneCCode: form.oneCCode.trim() || undefined,
    description: form.description.trim(),
    links: form.links.map((l) => l.trim()).filter(Boolean),
    type: form.type,
    price: toNum(form.price),
    shippingParams: {
      weight: toNum(form.shippingParams.weight),
      width: toNum(form.shippingParams.width),
      length: toNum(form.shippingParams.length),
      depth: toNum(form.shippingParams.depth),
    },
    stock: form.stock.trim() || "studio",
    color: form.color.trim(),
    category: form.category,
    tags: form.tags,
    isForPrinting: form.isForPrinting,
    image_url: form.image_url.trim(),
    galleryPhotos: form.galleryPhotos.map((p) => p.trim()).filter(Boolean),
    photos: form.photos.map((p) => p.trim()).filter(Boolean),
    editor_front_view: form.editor_front_view.trim(),
    editor_back_view: form.editor_back_view.trim(),
    editor_lsleeve_view: form.editor_lsleeve_view.trim(),
    editor_rsleeve_view: form.editor_rsleeve_view.trim(),
    sizes: form.sizes
      .filter((s) => s.name.trim())
      .map((s) => ({ name: s.name.trim(), qty: toNum(s.qty) })),
    friends: form.friends.trim(),
  };
};

type AdminProductFormProps = {
  mode: "create" | "edit";
  product?: IProduct;
};

const AdminProductForm: React.FC<AdminProductFormProps> = ({
  mode,
  product,
}) => {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(
    product ? productToForm(product) : emptyForm()
  );
  const [successMessage, setSuccessMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [uploadField, setUploadField] = useState<string | null>(null);
  const [photoError, setPhotoError] = useState("");

  const [createProduct, { isLoading: isCreating, error: createError }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating, error: updateError }] =
    useUpdateProductMutation();
  const [uploadProductPhoto, { isLoading: isUploading }] =
    useUploadProductPhotoMutation();
  const [deleteProductPhoto, { isLoading: isDeletingPhoto }] =
    useDeleteProductPhotoMutation();
  const { data: categoriesData, isLoading: isCategoriesLoading } =
    useGetCategoriesQuery();
  const categories = categoriesData?.data ?? [];
  const { data: tagsData, isLoading: isTagsLoading } = useGetTagsQuery();
  const tags = tagsData?.data ?? [];

  // Keyed by id only: photo actions refetch the product, and re-syncing on
  // every refetch would wipe unsaved edits in the rest of the form.
  useEffect(() => {
    if (product) setForm(productToForm(product));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?._id]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadToCdn = async (file: File): Promise<string | null> => {
    if (!product?._id) return null;
    const data = new FormData();
    data.append("files", file);
    const res = await uploadProductPhoto({
      id: product._id,
      body: data,
    }).unwrap();
    return res.data?.url ?? null;
  };

  // Photo operations hit the database right away: the CDN object already
  // exists at that point, so leaving the form unsaved would orphan it.
  const persistPhotos = async (photos: string[]) => {
    if (!product?._id) return;
    setField("photos", photos);
    await updateProduct({ id: product._id, body: { photos } }).unwrap();
    await revalidateShopData(product.slug);
  };

  const addPhotosHandler = async (files: FileList) => {
    setPhotoError("");
    setUploadField("photos");
    try {
      const uploaded: string[] = [];
      for (const file of Array.from(files)) {
        const url = await uploadToCdn(file);
        if (url) uploaded.push(url);
      }
      if (uploaded.length) {
        await persistPhotos([...form.photos, ...uploaded]);
      }
    } catch (err) {
      setPhotoError(getErrorMessage(err));
    } finally {
      setUploadField(null);
    }
  };

  const removePhotoHandler = async (url: string) => {
    if (!product?._id) return;
    setPhotoError("");
    try {
      await deleteProductPhoto({ id: product._id, url }).unwrap();
      setField(
        "photos",
        form.photos.filter((item) => item !== url)
      );
      await revalidateShopData(product.slug);
    } catch (err) {
      setPhotoError(getErrorMessage(err));
    }
  };

  const movePhotoHandler = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= form.photos.length) return;
    const next = [...form.photos];
    [next[index], next[target]] = [next[target], next[index]];
    setPhotoError("");
    try {
      await persistPhotos(next);
    } catch (err) {
      setPhotoError(getErrorMessage(err));
    }
  };

  const uploadEditorViewHandler = async (
    file: File,
    key: (typeof EDITOR_VIEWS)[number][0]
  ) => {
    setPhotoError("");
    setUploadField(key);
    try {
      const url = await uploadToCdn(file);
      if (url) setField(key, url);
    } catch (err) {
      setPhotoError(getErrorMessage(err));
    } finally {
      setUploadField(null);
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSuccessMessage("");
    setFormError("");

    if (!form.slug.trim()) {
      setFormError("Slug обязателен");
      return;
    }
    const namedSizes = form.sizes.filter((s) => s.name.trim());
    if (namedSizes.length < 1) {
      setFormError("Добавьте хотя бы один размер");
      return;
    }
    if (form.category.length < 1) {
      setFormError("Выберите хотя бы одну категорию");
      return;
    }

    const body = formToPayload(form);
    try {
      if (mode === "create") {
        const res = await createProduct(body).unwrap();
        await revalidateShopData(body.slug);
        router.push(`/profile/products/${res.data._id}`);
        return;
      }
      if (!product?._id) return;
      await updateProduct({ id: product._id, body }).unwrap();
      await revalidateShopData(body.slug, product.slug);
      setSuccessMessage("Сохранено.");
    } catch {
      /* error from mutation */
    }
  };

  const mutationError = createError || updateError;
  const isSaving = isCreating || isUpdating;
  const isPhotoBusy = isUploading || isDeletingPhoto || isUpdating;

  return (
    <form className={styles.admin_form} onSubmit={submitHandler}>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>
          {mode === "create" ? "Новый товар" : "Редактирование товара"}
        </h1>
        <Link href="/profile/categories" className={styles.admin_buttonSecondary}>
          Управление категориями
        </Link>
        <Link href="/profile/tags" className={styles.admin_buttonSecondary}>
          Управление тегами
        </Link>
      </div>

      {successMessage && (
        <p className={styles.admin_status}>{successMessage}</p>
      )}
      {formError && <p className={styles.admin_error}>{formError}</p>}
      {mutationError && (
        <p className={styles.admin_error}>{getErrorMessage(mutationError)}</p>
      )}

      <div className={styles.admin_formGrid}>
        <TextField
          label="Название"
          required
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.name}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("name", e.target.value)
          }
        />
        <TextField
          label="Slug"
          required
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.slug}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("slug", e.target.value)
          }
          helperText="Уникальный идентификатор в URL"
        />
        <TextField
          select
          label="Тип"
          required
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.type}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("type", e.target.value)
          }
        >
          {PRODUCT_TYPES.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Категории"
          required
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.category}
          disabled={isCategoriesLoading}
          helperText={
            categories.length === 0 && !isCategoriesLoading
              ? "Категорий пока нет — создайте их в разделе «Категории»"
              : undefined
          }
          SelectProps={{
            multiple: true,
            renderValue: (selected) =>
              (selected as string[])
                .map(
                  (value) =>
                    categories.find((opt) => opt._id === value)?.label ??
                    value
                )
                .join(", "),
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setField("category", e.target.value as unknown as string[]);
          }}
        >
          {categories.map((opt) => (
            <MenuItem key={opt._id} value={opt._id}>
              <Checkbox checked={form.category.includes(opt._id)} />
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Теги"
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.tags}
          disabled={isTagsLoading}
          helperText={
            tags.length === 0 && !isTagsLoading
              ? "Тегов пока нет — создайте их в разделе «Теги»"
              : undefined
          }
          SelectProps={{
            multiple: true,
            renderValue: (selected) =>
              (selected as string[])
                .map(
                  (value) =>
                    tags.find((opt) => opt._id === value)?.label ?? value
                )
                .join(", "),
          }}
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setField("tags", e.target.value as unknown as string[]);
          }}
        >
          {tags.map((opt) => (
            <MenuItem key={opt._id} value={opt._id}>
              <Checkbox checked={form.tags.includes(opt._id)} />
              <ListItemText primary={opt.label} />
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Цвет"
          required
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.color}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("color", e.target.value)
          }
        />
        <TextField
          label="Цена"
          required
          type="number"
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.price}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("price", e.target.value)
          }
        />
        <TextField
          label="Код 1С"
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.oneCCode}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("oneCCode", e.target.value)
          }
        />
        <TextField
          label="Склад (stock)"
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.stock}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("stock", e.target.value)
          }
        />
        {/* <TextField
          label="Friends"
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.friends}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("friends", e.target.value)
          }
        /> */}
      </div>

      <TextField
        label="Описание"
        required
        fullWidth
        multiline
        minRows={3}
        size="small"
        sx={textFieldSx}
        value={form.description}
        onChange={(e: ChangeEvent<HTMLInputElement>) =>
          setField("description", e.target.value)
        }
      />

      <div className={styles.admin_checks}>
        <FormControlLabel
          control={
            <Checkbox
              checked={form.isForPrinting}
              onChange={(e) => setField("isForPrinting", e.target.checked)}
            />
          }
          label="Для печати"
        />
      </div>

      <div className={styles.admin_formSection}>
        <p className={styles.admin_formSectionTitle}>Габариты доставки</p>
        <div className={styles.admin_formGrid}>
          {(
            [
              ["weight", "Вес"],
              ["width", "Ширина"],
              ["length", "Длина"],
              ["depth", "Глубина"],
            ] as const
          ).map(([key, label]) => (
            <TextField
              key={key}
              label={label}
              type="number"
              fullWidth
              size="small"
              sx={textFieldSx}
              value={form.shippingParams[key]}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setField("shippingParams", {
                  ...form.shippingParams,
                  [key]: e.target.value,
                })
              }
            />
          ))}
        </div>
      </div>

      <div className={styles.admin_formSection}>
        <p className={styles.admin_formSectionTitle}>Фото товара</p>
        {photoError && <p className={styles.admin_error}>{photoError}</p>}

        {mode === "create" ? (
          <p className={styles.admin_hint}>
            Сохраните товар, затем добавьте фото.
          </p>
        ) : (
          <>
            {form.photos.length === 0 && (
              <p className={styles.admin_hint}>
                Фото не загружены. Добавьте их — они попадут на CDN и станут
                источником изображений в каталоге.
              </p>
            )}

            <div className={styles.admin_photoGrid}>
              {form.photos.map((photo, index) => (
                <div key={photo} className={styles.admin_photoCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className={styles.admin_photoImg} src={photo} alt="" />
                  {index === 0 && (
                    <p className={styles.admin_photoBadge}>Главное фото</p>
                  )}
                  <div className={styles.admin_photoActions}>
                    <button
                      type="button"
                      className={styles.admin_buttonSecondary}
                      disabled={index === 0 || isPhotoBusy}
                      onClick={() => void movePhotoHandler(index, -1)}
                      aria-label="Сдвинуть влево"
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      className={styles.admin_buttonSecondary}
                      disabled={index === form.photos.length - 1 || isPhotoBusy}
                      onClick={() => void movePhotoHandler(index, 1)}
                      aria-label="Сдвинуть вправо"
                    >
                      →
                    </button>
                    <button
                      type="button"
                      className={styles.admin_buttonDanger}
                      disabled={isPhotoBusy}
                      onClick={() => void removePhotoHandler(photo)}
                      aria-label="Удалить фото"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <label>
              <input
                type="file"
                accept="image/*"
                multiple
                hidden
                disabled={isPhotoBusy}
                onChange={(e) => {
                  const files = e.target.files;
                  if (!files?.length) return;
                  void addPhotosHandler(files);
                  e.target.value = "";
                }}
              />
              <span className={styles.admin_buttonSecondary}>
                {isUploading && uploadField === "photos"
                  ? "Загружаем..."
                  : "+ фото"}
              </span>
            </label>
          </>
        )}
      </div>

      <div className={styles.admin_formSection}>
        {/* <p className={styles.admin_formSectionTitle}>
          Изображения для конструктора
        </p> */}
        {/* {mode === "create" ? (
          <p className={styles.admin_hint}>
            Сохраните товар, затем загрузите виды для конструктора.
          </p>
        ) : (
          EDITOR_VIEWS.map(([key, label]) => (
            <div key={key} className={styles.admin_arrayRow}>
              <TextField
                label={label}
                fullWidth
                size="small"
                sx={textFieldSx}
                value={form[key]}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setField(key, e.target.value)
                }
              />
              <label>
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  disabled={isPhotoBusy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    void uploadEditorViewHandler(file, key);
                    e.target.value = "";
                  }}
                />
                <span className={styles.admin_buttonSecondary}>
                  {isUploading && uploadField === key ? "..." : "Загрузить"}
                </span>
              </label>
            </div>
          ))
        )} */}
      </div>

      <div className={styles.admin_formSection}>
        <p className={styles.admin_formSectionTitle}>Размеры и остатки</p>
        {form.sizes.map((size, index) => (
          <div key={`size-${index}`} className={styles.admin_arrayRow}>
            <TextField
              label="Размер"
              required={index === 0}
              fullWidth
              size="small"
              sx={textFieldSx}
              value={size.name}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...form.sizes];
                next[index] = { ...next[index], name: e.target.value };
                setField("sizes", next);
              }}
            />
            <TextField
              label="Кол-во"
              type="number"
              size="small"
              sx={{ ...textFieldSx, width: 120 }}
              value={size.qty}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...form.sizes];
                next[index] = { ...next[index], qty: e.target.value };
                setField("sizes", next);
              }}
            />
            <button
              type="button"
              className={styles.admin_buttonDanger}
              disabled={form.sizes.length <= 1}
              onClick={() => {
                if (form.sizes.length <= 1) return;
                setField(
                  "sizes",
                  form.sizes.filter((_, i) => i !== index)
                );
              }}
            >
              −
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.admin_buttonSecondary}
          onClick={() =>
            setField("sizes", [...form.sizes, { name: "", qty: "0" }])
          }
        >
          + размер
        </button>
      </div>

      {/* <div className={styles.admin_formSection}>
        <p className={styles.admin_formSectionTitle}>Ссылки</p>
        {form.links.map((link, index) => (
          <div key={`link-${index}`} className={styles.admin_arrayRow}>
            <TextField
              label={`Ссылка ${index + 1}`}
              fullWidth
              size="small"
              sx={textFieldSx}
              value={link}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...form.links];
                next[index] = e.target.value;
                setField("links", next);
              }}
            />
            <button
              type="button"
              className={styles.admin_buttonDanger}
              onClick={() =>
                setField(
                  "links",
                  form.links.filter((_, i) => i !== index)
                )
              }
            >
              −
            </button>
          </div>
        ))}
        <button
          type="button"
          className={styles.admin_buttonSecondary}
          onClick={() => setField("links", [...form.links, ""])}
        >
          + ссылка
        </button>
      </div> */}

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
        <button
          type="button"
          className={styles.admin_buttonSecondary}
          onClick={() => router.push("/profile/products")}
        >
          К списку
        </button>
      </div>
    </form>
  );
};

export default AdminProductForm;
