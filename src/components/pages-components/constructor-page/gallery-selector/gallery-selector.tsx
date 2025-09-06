"use client";
import React, { useState } from "react";
import styles from "./gallery-selector.module.css";
import { ICartOrderElement } from "@/app/utils/types";
import { v4 as uuidv4 } from "uuid";
import { useAppSelector, useAppDispatch } from "@/redux/redux-hooks";
import { actions as constructorActions } from "@/redux/constructor-slice/constructor.slice";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useUploadPrintImageMutation, useGetGalleryImagesQuery } from "@/api/api";
import Image from "next/image";
import { photoProcessing } from "@/app/utils/constructor-utils";

interface GalleryImage {
    id: string;
    src: string;
    alt: string;
}

const GallerySelector: React.FC<{ orderElement: ICartOrderElement }> = ({
    orderElement,
}) => {
    const dispatch = useAppDispatch();
    const { activeView } = useAppSelector((store) => store.printConstructor);
    const { prints } = orderElement;
    // @ts-ignore
    const currentPrint = prints && prints[activeView];

    const [uploadPrint, print] = useUploadPrintImageMutation();
    const [isLoading, setIsLoading] = useState(false);
    
    // Получаем изображения из API
    const { data: apiGalleryImages = [], isLoading: isGalleryLoading, error } = useGetGalleryImagesQuery();
    
    // Fallback галерея на случай, если API еще не готов
    const fallbackGallery: GalleryImage[] = [
        { id: '1', src: '/cookie.jpg', alt: 'Изображение 1' },
        { id: '2', src: '/cookie.jpg', alt: 'Изображение 2' },
        { id: '3', src: '/cookie.jpg', alt: 'Изображение 3' },
        { id: '4', src: '/cookie.jpg', alt: 'Изображение 4' },
        { id: '5', src: '/cookie.jpg', alt: 'Изображение 5' },
        { id: '6', src: '/cookie.jpg', alt: 'Изображение 6' },
    ];
    
    // Используем данные из API, если они есть, иначе fallback
    const galleryImages = apiGalleryImages.length > 0 ? apiGalleryImages : fallbackGallery;



    const handleImageSelect = async (image: GalleryImage) => {
        setIsLoading(true);
        dispatch(constructorActions.imageLoaderToggler());
        try {
            // Загружаем изображение из URL
            const response = await fetch(image.src);
            const blob = await response.blob();
            
            // Создаем File объект из blob
            const file = new File([blob], `${image.id}_gallery.jpg`, { type: 'image/jpeg' });
            const print = photoProcessing(file);
            if (print === undefined) {
                console.error('Что-то пошло не так');
            }
            // Создаем FormData и отправляем на сервер
            const data = new FormData();
            data.append("files", print, `${uuidv4()}_${print.name}`);
            
            const uploadedPrint = await uploadPrint(data);
            if (uploadedPrint) {

                // @ts-ignore
                dispatch(cartActions.setPrint({ print: uploadedPrint, activeView, itemCartId: orderElement.itemCartId, itemType: orderElement.item.type, itemColor: orderElement.item.color }));
            }
            // if (uploadedPrint && 'data' in uploadedPrint) {
            //     dispatch(cartActions.setPrint({ 
            //         print: uploadedPrint.data, 
            //         activeView, 
            //         itemCartId: orderElement.itemCartId, 
            //         itemType: orderElement.item.type, 
            //         itemColor: orderElement.item.color 
            //     }));
            // }
            dispatch(constructorActions.imageLoaderToggler());
        } catch (error) {
            console.error('Ошибка при загрузке изображения из галереи:', error);
            dispatch(constructorActions.imageLoaderToggler());
        } finally {
            setIsLoading(false);
            dispatch(constructorActions.imageLoaderToggler());
        }
    };

    const deletePrint = () => {
        dispatch(cartActions.deletePrint({ activeView, itemCartId: orderElement.itemCartId }));
    };

    return (
        <div className={styles.gallery_container}>
            <div className={styles.gallery_header}>
                <h3 className={styles.gallery_title}>Выберите изображение из галереи</h3>
                {currentPrint && (
                    <button
                        type="button"
                        className={styles.delete_button}
                        onClick={deletePrint}
                    >
                        Удалить текущее
                    </button>
                )}
            </div>
            
            {isLoading && (
                <div className={styles.loader_wrapper}>
                    <div className={styles.loader}>
                        <div className={styles.loader_icon} />
                    </div>
                </div>
            )}
            
            {isGalleryLoading && (
                <div className={styles.loader_wrapper}>
                    <div className={styles.loader}>
                        <div className={styles.loader_icon} />
                    </div>
                    <p>Загрузка галереи...</p>
                </div>
            )}
            
            {error && apiGalleryImages.length === 0 && (
                <div className={styles.error_wrapper}>
                    <p>Ошибка загрузки галереи. Попробуйте позже.</p>
                </div>
            )}
            
            {(!isGalleryLoading || apiGalleryImages.length === 0) && (
                <div className={styles.gallery_grid}>
                    {galleryImages.length > 0 ? (
                        galleryImages.map((image: GalleryImage) => (
                            <div
                                key={image.id}
                                className={styles.gallery_item}
                                onClick={() => handleImageSelect(image)}
                            >
                                <Image
                                    src={image.src}
                                    alt={image.alt}
                                    width={100}
                                    height={100}
                                    className={styles.gallery_image}
                                />
                            </div>
                        ))
                    ) : (
                        <p className={styles.empty_gallery}>Галерея пуста</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default GallerySelector;
