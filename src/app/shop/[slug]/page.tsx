import React from "react";
import styles from "./page.module.css";
import { getShopData } from "@/app/utils/constants";
import { IProduct } from "@/app/utils/types";
import ProductDescription from "@/components/pages-components/shop-page/product-description/product-description";
import { Metadata } from 'next'
import { apiBaseUrl } from "@/app/utils/constants";
import { SITE_INFO } from "@/app/constants";
import ProductGallery from "@/components/pages-components/shop-page/product-gallery/product-gallery";

type TMetadataProps = {
    params: { slug: string },
    searchParams: { id: string },
}

export const generateStaticParams = async () => {
    const data = await getShopData();
    // console.log(data)

    return data.map((item: IProduct) => ({ slug: item.slug }))
}

export async function generateMetadata({ params, searchParams }: TMetadataProps): Promise<Metadata> {
    const [currItem]: Array<IProduct> = await getShopData({ slug: params.slug });

    return {
        title: `${currItem?.name} | PINHEAD STUDIO`,
        description: `${currItem?.name} - ${currItem?.description}`,
        keywords: [currItem?.category!, currItem?.type!, currItem?.color!],
        openGraph: {
            images: `${apiBaseUrl}${currItem?.image_url}`,
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
        <section className={styles.screen}>
            <ProductGallery item={item} />
            <ProductDescription item={item} />
        </section>
    );
};

export default ProductPage;
