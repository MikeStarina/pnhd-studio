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

export async function generateMetadata ({ params, searchParams }: TMetadataProps): Promise<Metadata> {
    const shopData: Array<IProduct> = await getShopData();
    const currItem = shopData.find(item => item._id === searchParams.id);
    return {
      title: currItem?.name,
      description: currItem?.description,
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
}> = async ({ searchParams }) => {

    const { id } = searchParams;
    const shopData: Array<IProduct> = await getShopData();
    const item = shopData?.filter((item) => item._id === id)[0];
    return (
        <section className={styles.screen}>
            {/* {screenWidth.width > 1250 ? <Photos {...item} /> : <PhotosMobile {...item} />} */}
            <Photos item={item} />
            <ProductDescription item={item} />
        </section>
    );
};

export default ProductPage;
