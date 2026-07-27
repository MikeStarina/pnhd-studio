'use client'
import React from "react";
import { Image } from "react-konva";
import useImage from "use-image";
import { absoluteMediaUrl } from "@/app/utils/product-photos";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { IProduct } from "@/app/utils/types";

const Mockup: React.FC<{ item: IProduct}> = ({ item }) => {
    //console.log(item);
    const { activeView } = useAppSelector((store) => store.printConstructor);
    //console.log(activeView);
    const mockup =
        activeView === "front"
            ? absoluteMediaUrl(item.editor_front_view)
            : activeView === "back"
                ? absoluteMediaUrl(item.editor_back_view)
                : activeView === "lsleeve"
                    ? absoluteMediaUrl(item.editor_lsleeve_view)
                    : activeView === "rsleeve"
                        ? absoluteMediaUrl(item.editor_rsleeve_view)
                        : null;
    //console.log(mockup);
    const [mockupImg] = useImage(mockup!, "anonymous");

    return <Image image={mockupImg} width={500} height={496} alt='мокап'/>;
}

export default Mockup;
