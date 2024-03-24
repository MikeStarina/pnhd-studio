'use client'
import React from "react";
import { Image } from "react-konva";
import useImage from "use-image";
import { apiBaseUrl } from "@/app/utils/constants";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { IProduct } from "@/app/utils/types";

const Mockup: React.FC<{ item: IProduct}> = ({ item }) => {
    //console.log(item);
    const { activeView } = useAppSelector((store) => store.printConstructor);
    //console.log(activeView);
    const mockup =
        activeView === "front"
            ? `${apiBaseUrl}${item.editor_front_view}`
            : activeView === "back"
                ? `${apiBaseUrl}${item.editor_back_view}`
                : activeView === "lsleeve"
                    ? `${apiBaseUrl}${item.editor_lsleeve_view}`
                    : activeView === "rsleeve"
                        ? `${apiBaseUrl}${item.editor_rsleeve_view}`
                        : null;
    //console.log(mockup);
    const [mockupImg] = useImage(mockup!, "anonymous");

    return <Image image={mockupImg} width={500} height={496} alt='мокап'/>;
}

export default Mockup;
