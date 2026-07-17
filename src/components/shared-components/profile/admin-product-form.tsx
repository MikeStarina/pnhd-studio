"use client";
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import TextField from "@mui/material/TextField";
import FormControlLabel from "@mui/material/FormControlLabel";
import Checkbox from "@mui/material/Checkbox";
import MenuItem from "@mui/material/MenuItem";
import {
  useCreateProductMutation,
  useUpdateProductMutation,
  useUploadPrintImageMutation,
} from "@/api/api";
import { IProduct, TProductInput } from "@/app/utils/types";
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

const PRODUCT_CATEGORIES = [
  { label: "Мужское", value: "man" },
  { label: "Женское", value: "woman" },
  { label: "Детское", value: "kids" },
  { label: "Аксессуары", value: "accesorize" },
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
  category: string;
  isSale: boolean;
  isForPrinting: boolean;
  image_url: string;
  galleryPhotos: string[];
  editor_front_view: string;
  editor_back_view: string;
  editor_lsleeve_view: string;
  editor_rsleeve_view: string;
  sizes: Array<{ name: string; qty: string }>;
  friends: string;
};

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
  category: "man",
  isSale: false,
  isForPrinting: true,
  image_url: "",
  galleryPhotos: [],
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
  category: product.category ?? "man",
  isSale: Boolean(product.isSale),
  isForPrinting: product.isForPrinting !== false,
  image_url: product.image_url ?? "",
  galleryPhotos: product.galleryPhotos?.length
    ? [...product.galleryPhotos]
    : [],
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
    isSale: form.isSale,
    isForPrinting: form.isForPrinting,
    image_url: form.image_url.trim(),
    galleryPhotos: form.galleryPhotos.map((p) => p.trim()).filter(Boolean),
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

  const [createProduct, { isLoading: isCreating, error: createError }] =
    useCreateProductMutation();
  const [updateProduct, { isLoading: isUpdating, error: updateError }] =
    useUpdateProductMutation();
  const [uploadPrintImage, { isLoading: isUploading }] =
    useUploadPrintImageMutation();

  useEffect(() => {
    if (product) setForm(productToForm(product));
  }, [product]);

  const setField = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const uploadToField = async (
    file: File,
    apply: (url: string) => void
  ) => {
    const data = new FormData();
    data.append("files", file);
    try {
      const res = await uploadPrintImage(data).unwrap();
      const url =
        res.data?.url ??
        (res as unknown as { url?: string }).url;
      if (url) apply(url);
    } catch {
      /* ignore; user can paste URL */
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

  return (
    <form className={styles.admin_form} onSubmit={submitHandler}>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>
          {mode === "create" ? "Новый товар" : "Редактирование товара"}
        </h1>
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
          label="Категория"
          required
          fullWidth
          size="small"
          sx={textFieldSx}
          value={form.category}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setField("category", e.target.value)
          }
        >
          {PRODUCT_CATEGORIES.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              {opt.label}
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
              checked={form.isSale}
              onChange={(e) => setField("isSale", e.target.checked)}
            />
          }
          label="Sale"
        />
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
        {/* <p className={styles.admin_formSectionTitle}>Изображения</p> */}
        {/* {(
          [
            ["image_url", "Главное фото"],
            ["editor_front_view", "Editor front"],
            ["editor_back_view", "Editor back"],
            ["editor_lsleeve_view", "Editor left sleeve"],
            ["editor_rsleeve_view", "Editor right sleeve"],
          ] as const
        ).map(([key, label]) => (
          <div key={key} className={styles.admin_arrayRow}>
            <TextField
              label={label}
              required={key === "image_url"}
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
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadField(key);
                  void uploadToField(file, (url) => setField(key, url));
                }}
              />
              <span className={styles.admin_buttonSecondary}>
                {isUploading && uploadField === key ? "..." : "Upload"}
              </span>
            </label>
          </div>
        ))} */}

        {/* <p className={styles.admin_formSectionTitle}>Галерея</p> */}
        {/* {form.galleryPhotos.map((photo, index) => (
          <div key={`gallery-${index}`} className={styles.admin_arrayRow}>
            <TextField
              label={`Галерея ${index + 1}`}
              fullWidth
              size="small"
              sx={textFieldSx}
              value={photo}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                const next = [...form.galleryPhotos];
                next[index] = e.target.value;
                setField("galleryPhotos", next);
              }}
            />
            <button
              type="button"
              className={styles.admin_buttonDanger}
              onClick={() =>
                setField(
                  "galleryPhotos",
                  form.galleryPhotos.filter((_, i) => i !== index)
                )
              }
            >
              −
            </button>
          </div>
        ))} */}
        {/* <button
          type="button"
          className={styles.admin_buttonSecondary}
          onClick={() =>
            setField("galleryPhotos", [...form.galleryPhotos, ""])
          }
        >
          + фото галереи
        </button> */}
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
