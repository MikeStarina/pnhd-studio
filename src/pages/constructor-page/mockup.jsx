import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { Image } from "react-konva";
import front_tee_mockup from '../../components/images/front_tee_mockup.png';
import back_tee_mockup from '../../components/images/back_tee_mockup.png';
import lsleeve_tee_mockup from '../../components/images/lsleeve_tee_mockup.png';
import rsleeve_tee_mockup from '../../components/images/rsleeve_tee_mockup.png';
import useImage from "use-image";


const Mockup = ({ item }) => {

    const { activeView } = useSelector(store => store.editorState);
    const mockup = activeView === 'front' ? front_tee_mockup
    : activeView === 'back' ? back_tee_mockup
    : activeView === 'lsleeve' ? lsleeve_tee_mockup
    : activeView === 'rsleeve' ? rsleeve_tee_mockup : null;

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