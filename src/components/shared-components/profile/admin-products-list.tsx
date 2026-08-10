"use client";
import React, { useMemo } from "react";
import Link from "next/link";
import {
  useDeleteProductMutation,
  useGetCategoriesQuery,
  useGetProductsQuery,
} from "@/api/api";
import { productPhotoSources } from "@/app/utils/product-photos";
import { revalidateShopData } from "@/app/utils/server-actions";
import { getErrorMessage } from "@/components/shared-components/auth/auth-utils";
import styles from "@/app/profile/profile.module.css";
import { IProduct } from "@/app/utils/types";
import { toCategoryArray } from "@/app/utils/product-categories";
import { ImageComponent } from "@/components/pages-components/shop-page/product-photos/imageComponent";

const categoryLabels = (
  category: unknown,
  categoryMap: Map<string, string>
): string =>
  toCategoryArray(category)
    .map((value) => categoryMap.get(value) ?? value)
    .join(", ");

const AdminProductsList: React.FC = () => {
  const { data, isLoading, error } = useGetProductsQuery();
  const { data: categoriesData } = useGetCategoriesQuery();
  const [deleteProduct, { isLoading: isDeleting, error: deleteError }] =
    useDeleteProductMutation();

  const products = useMemo(() => {
    const list = [...(data?.data ?? [])];
    list.sort((a, b) => {
      const orderDiff = (a.order ?? 0) - (b.order ?? 0);
      if (orderDiff !== 0) return orderDiff;
      const aTime = a.createdAt ? Date.parse(a.createdAt) : 0;
      const bTime = b.createdAt ? Date.parse(b.createdAt) : 0;
      if (aTime !== bTime) return aTime - bTime;
      return (a.name ?? "").localeCompare(b.name ?? "", "ru");
    });
    return list;
  }, [data?.data]);
  const categoryMap = new Map(
    (categoriesData?.data ?? []).map((item) => [item._id, item.label])
  );

  const deleteHandler = async (product: IProduct) => {
    if (!window.confirm(`Удалить товар «${product.name}»?`)) return;
    try {
      await deleteProduct(product._id).unwrap();
      await revalidateShopData(product.slug);
    } catch {
      /* error from mutation state */
    }
  };

  if (isLoading) {
    return <p className={styles.admin_status}>Загружаем товары...</p>;
  }

  if (error) {
    return (
      <p className={styles.admin_error}>{getErrorMessage(error)}</p>
    );
  }

  return (
    <div>
      <div className={styles.admin_header}>
        <h1 className={styles.admin_title}>Товары</h1>
        <Link href="/profile/products/new" className={styles.admin_button}>
          Создать
        </Link>
      </div>

      {deleteError && (
        <p className={styles.admin_error}>{getErrorMessage(deleteError)}</p>
      )}

      {products.length === 0 ? (
        <p className={styles.admin_status}>Товаров пока нет.</p>
      ) : (
        <table className={styles.admin_table}>
          <thead>
            <tr>
              <th />
              <th>Название</th>
              <th>Порядок</th>
              <th>Тип</th>
              <th>Категория</th>
              <th>Цвет</th>
              <th>Цена</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <ListItem
                key={product._id}
                product={product}
                categoryMap={categoryMap}
                isDeleting={isDeleting}
                deleteHandler={deleteHandler}
              />
              // <tr key={product._id}>
              //   <td>
              //     {/* eslint-disable-next-line @next/next/no-img-element */}
              //     <img
              //       className={styles.admin_thumb}
              //       src={imageSrc(product.image_url)}
              //       alt=""
              //       onError={(e) => {
              //         const el = e.currentTarget;
              //         if (!product.image_url) return;
              //         if (!el.src.startsWith(apiBaseUrl)) {
              //           el.src = `${apiBaseUrl}${product.image_url}`;
              //         }
              //       }}
              //     />
              //   </td>
              //   <td>
              //     <Link
              //       href={`/profile/products/${product._id}`}
              //       className={styles.admin_rowLink}
              //     >
              //       {product.name}
              //     </Link>
              //   </td>
              //   <td>{product.type}</td>
              //   <td>{product.category}</td>
              //   <td>{product.color}</td>
              //   <td>{product.price}</td>
              //   <td>
              //     <div className={styles.admin_actions}>
              //       <Link
              //         href={`/profile/products/${product._id}`}
              //         className={styles.admin_buttonSecondary}
              //       >
              //         Изменить
              //       </Link>
              //       <button
              //         type="button"
              //         className={styles.admin_buttonDanger}
              //         disabled={isDeleting}
              //         onClick={() =>
              //           deleteHandler(product._id, product.name)
              //         }
              //       >
              //         Удалить
              //       </button>
              //     </div>
              //   </td>
              // </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};


interface IListItemProps {
  product: IProduct;
  categoryMap: Map<string, string>;
  isDeleting: boolean;
  deleteHandler: (product: IProduct) => void;
}

const ListItem: React.FC<IListItemProps> = ({
  product,
  categoryMap,
  isDeleting,
  deleteHandler,
}) => {

  const photo = useMemo(() => productPhotoSources(product, 0), [product]);
  return (
    <tr key={product._id}>
      <td>
        <ImageComponent
          src={photo}
          className={styles.admin_thumb}
          width={100}
          height={100}
        />
      </td>
      <td>
        <Link
          href={`/profile/products/${product._id}`}
          className={styles.admin_rowLink}
        >
          {product.name}
        </Link>
      </td>
      <td>{product.order ?? 0}</td>
      <td>{product.type}</td>
      <td>{categoryLabels(product.category, categoryMap)}</td>
      <td>{product.color}</td>
      <td>{product.price}</td>
      <td>
        <div className={styles.admin_actions}>
          <Link
            href={`/profile/products/${product._id}`}
            className={styles.admin_buttonSecondary}
          >
            Изменить
          </Link>
          <button
            type="button"
            className={styles.admin_buttonDanger}
            disabled={isDeleting}
            onClick={() => deleteHandler(product)}
          >
            Удалить
          </button>
        </div>
      </td>
    </tr>
  );
};

export default AdminProductsList;
