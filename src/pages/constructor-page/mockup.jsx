import React from "react";
import { useSelector } from "react-redux";
import { Image } from "react-konva";
import { apiBaseUrl } from "../../utils/constants";
import useImage from "use-image";


const Mockup = ({ item }) => {
    

    const { activeView } = useSelector(store => store.editorState);
    const mockup = activeView === 'front' ? `${apiBaseUrl}${item.attributes.editor_front_view}`
    : activeView === 'back' ? `${apiBaseUrl}${item.attributes.editor_back_view}`
    : activeView === 'lsleeve' ? `${apiBaseUrl}${item.attributes.editor_lsleeve_view}`
    : activeView === 'rsleeve' ? `${apiBaseUrl}${item.attributes.editor_rsleeve_view}` : null;

    const [mockupImg] = useImage(mockup, 'Anonymous');

    return (
        <Image
            image={mockupImg}
            width={500}
            height={496}
        />
    );
}

export default Mockup;