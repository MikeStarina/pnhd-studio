import { Metadata } from "next";
import { getShopData } from "@/app/utils/constants";
import { IProduct } from "@/app/utils/types";
import { CATALOG_CATEGORIES, getTags, inStock, sortForShop } from "@/components/catalog/data";
import ProductCard from "@/components/catalog/product-card/product-card";
import CartSuggestions from "@/components/pages-components/cart-page/cart-suggestions/cart-suggestions";
import CartClient from "./CartClient";

export const metadata: Metadata = {
    title: "Корзина покупок | Оформление заказа",
    description: "Твои товары в корзине. Проверь выбранные товары перед оформлением заказа.",
    metadataBase: new URL("https://studio.pnhd.ru"),
    alternates: {
        canonical: "/cart",
    },
};

/** Сколько карточек каждого вида изделия отдаём в подборку: хватает, даже если пара из них уже в корзине */
const PER_TYPE = 4;

export default async function Page() {
    const [allProducts, tags] = await Promise.all([getShopData() as Promise<IProduct[]>, getTags()]);
    const all = sortForShop(allProducts ?? []);
    const pool = CATALOG_CATEGORIES.flatMap(({ type }) =>
        all.filter((product) => product.type === type && inStock(product)).slice(0, PER_TYPE)
    );

    return (
        <div data-layout="wide">
            <CartClient />
            <CartSuggestions
                cards={pool.map((product) => ({
                    id: product._id,
                    type: product.type,
                    card: <ProductCard product={product} all={all} tags={tags} titleAs="h3" />,
                }))}
            />
        </div>
    );
}
