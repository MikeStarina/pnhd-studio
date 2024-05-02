import React from "react";
import styles from "./page.module.css";
import { getShopData } from "@/app/utils/constants";
import { IProduct } from "@/app/utils/types";
import Photos from "@/components/pages-components/shop-page/product-photos/product-photos";
import ProductDescription from "@/components/pages-components/shop-page/product-description/product-description";
import { Metadata, ResolvingMetadata } from 'next'
import { apiBaseUrl } from "@/app/utils/constants";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";

type TMetadataProps = {
    item: IProduct
    params: { slug: string },
    searchParams: { id: string },
}

export async function generateMetadata ({ params, searchParams, item }: TMetadataProps): Promise<Metadata> {
    const [ currItem ]: Array<IProduct> = await getShopData({...params});
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
}> = async ({ searchParams, params }) => {
    const [ item ]: Array<IProduct> = await getShopData({...params});
    return (
      <>
      <Header searchParams={searchParams}/>
        <section className={styles.screen}>
            <Photos item={item} />
            <ProductDescription item={item} />
        </section>
      <Footer searchParams={searchParams}/>
      </>
    );
};

export default ProductPage;
