"use client";
import React, { useEffect } from "react";
import styles from "./cart-icon.module.css";
import { useAppSelector } from "@/redux/redux-hooks";
import Link from "next/link";
import Image from "next/image";
import cartIcon from "../../../../public/cart_icon.svg";
import { usePathname } from "next/navigation";
import { useAppDispatch } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { ICartOrderElement } from "@/app/utils/types";
import { useRouter } from "next/navigation";

const CartIcon: React.FC = () => {
  const dispatch = useAppDispatch();
  const { order, paymentUrl } = useAppSelector((store) => store.cart);
  const router = useRouter();
  const pathname = usePathname();
  const containerStyles =
    order &&
    order.length > 0 &&
    pathname !== "/cart" &&
    pathname !== "/checkout" &&
    !pathname.includes("constructor")
      ? styles.cartIcon
      : styles.cartIcon__disabled;

  //  useEffect(() => {
  //       paymentUrl && router.push(paymentUrl);
  // }, [paymentUrl])

  useEffect(() => {
    const restoredOrder = sessionStorage.getItem('order');
    const parsedOrder: Array<ICartOrderElement> = JSON.parse(restoredOrder!);
    if (parsedOrder) {
      dispatch(cartActions.restoreCart(parsedOrder))
    }
  }, [])

  return (
    <div className={containerStyles}>
      <Link href="/cart" className={styles.cartIcon_link}>
        <button type="button" className={styles.cartIcon_button}>
          <Image src={cartIcon} alt="иконка корзины" />
          {order && order.length > 0 && (
            <div className={styles.cartIcon_counterBox}>
              <p className={styles.cartIcon_counter}>{order.length}</p>
            </div>
          )}
        </button>
      </Link>
    </div>
  );
};

export default CartIcon;
