"use client";
import React, { useEffect } from "react";
import styles from "./page.module.css";
import { useAppSelector } from "@/redux/redux-hooks";
import ProductImage from "@/components/pages-components/cart-page/product-image/product-image";
import ProductDescription from "@/components/pages-components/cart-page/product-description/product-description";
import PrintPreview from "@/components/pages-components/cart-page/print-preview/print-preview";
import CartItemTotalPrice from "@/components/pages-components/cart-page/cart-item-total-price/cart-item-total-price";
import CartSummary from "@/components/pages-components/cart-page/cart-summary/cart-summary";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";
import { useSearchParams } from "next/navigation";
import { splitString } from "../utils/constants";




const Cart: React.FC = () => {
  const { order } = useAppSelector((store) => store.cart);
  const router = useRouter();

  const params = splitString(useSearchParams().toString());

  useEffect(() => {
    const stringParams = useSearchParams().toString();
    const urlString = stringParams ? `?${stringParams}` : '';
    order?.length === 0 && router.replace(`/shop${urlString}`);
  }, [order])
  return (
    <>
    <Header searchParams={params}/>
    <section className={styles.cart}>
      {order!.map((elem) => {
        
        return (
          <div className={styles.cart_products} key={elem.itemCartId}>
            <ProductImage elem={elem}/>
            <ProductDescription elem={elem}/>
            <PrintPreview elem={elem}/>
            <CartItemTotalPrice elem={elem}/>            
          </div>
        );
      })}
      <CartSummary />
      <Link href={{pathname:'/checkout', query: {...params}}} className={styles.cart_checkoutLink}>
        <button type="button" className={styles.cart_checkoutButton}>оформить заказ</button>
      </Link>
    </section>
    <Footer searchParams={params}/>
    </>
  );
};

export default Cart;
