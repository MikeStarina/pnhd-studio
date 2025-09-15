import React from "react";
import styles from "./page.module.css";
import { getShopData } from "@/app/utils/constants";
import { IProduct } from "@/app/utils/types";
import Photos from "@/components/pages-components/shop-page/product-photos/product-photos";
import ProductDescription from "@/components/pages-components/shop-page/product-description/product-description";
import { Metadata, ResolvingMetadata } from 'next'
import { apiBaseUrl } from "@/app/utils/constants";



type TMetadataProps = {
    params: { slug: string },
    searchParams: { id: string },
}

export const generateStaticParams = async () => {
    const data = await getShopData();
    // console.log(data)

    return data.map((item: IProduct) => ({ slug: item.slug }))
}

export async function generateMetadata ({ params, searchParams }: TMetadataProps): Promise<Metadata> {
    const [ currItem ]: Array<IProduct> = await getShopData({ slug: params.slug});
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
      }
    }
  }


const ProductPage: React.FC<{
    params: { slug: string };
    searchParams: { id: string };
}> = async ({ params, searchParams }) => {

    const [ item ]: Array<IProduct> = await getShopData({ slug: params.slug});
    return (
        <section className={styles.screen}>
            <Photos item={item} />
            <ProductDescription item={item} />
        </section>
    );
};

export default ProductPage;
