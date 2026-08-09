import React from "react";
import styles from "./page.module.css";
import { getShopData, getCategoriesData } from "@/app/utils/constants";
import { IProduct } from "@/app/utils/types";
import ProductDescription from "@/components/pages-components/shop-page/product-description/product-description";
import { Metadata } from 'next'
import { productMainPhotoUrl } from "@/app/utils/product-photos";
import { toCategoryArray } from "@/app/utils/product-categories";
import { SITE_INFO } from "@/app/constants";
import ProductGallery from "@/components/pages-components/shop-page/product-gallery/product-gallery";
import Breadcrumbs from '@/components/shared-components/breadcrumbs/Breadcrumbs';

type TMetadataProps = {
    params: { slug: string },
    searchParams: { id: string },
}

export const generateStaticParams = async () => {
    const data = await getShopData();
    return (data ?? []).filter((item: IProduct) => item.slug).map((item: IProduct) => ({ slug: item.slug }));
}

export async function generateMetadata({ params, searchParams }: TMetadataProps): Promise<Metadata> {
    const [currItem]: Array<IProduct> = await getShopData({ slug: params.slug });
    const categories = await getCategoriesData().catch(() => []);
    const categoryLabels = toCategoryArray(currItem?.category)
        .map((id) => categories.find((c) => c._id === id)?.label ?? id);

    return {
        title: `${currItem?.name} | PINHEAD STUDIO`,
        description: `${currItem?.name} - ${currItem?.description}`,
        keywords: [...categoryLabels, currItem?.type!, currItem?.color!],
        openGraph: {
            images: currItem ? productMainPhotoUrl(currItem) : undefined,
            type: 'website',
            url: `https://studio.pnhd.ru/shop/${params.slug}?id=${searchParams.id}`,
            description: currItem?.description,
            siteName: 'PINHEAD STUDIO',
            title: currItem?.name,
        },
        alternates: {
            canonical: SITE_INFO.domain + '/shop/' + params.slug
        },
    }
}


const ProductPage: React.FC<{
    params: { slug: string };
    searchParams: { id: string };
}> = async ({ params }) => {

    const [item]: Array<IProduct> = await getShopData({ slug: params.slug });
    return (
        <>
            <Breadcrumbs items={[
                { label: 'Главная', href: '/' },
                { label: 'Каталог', href: '/shop' },
                { label: item?.name ?? '', href: `/shop/${params.slug}` },
            ]} />
            <section className={styles.screen}>
                <ProductGallery item={item} />
                <ProductDescription item={item} />
            </section>
        </>
    );
};

export default ProductPage;
