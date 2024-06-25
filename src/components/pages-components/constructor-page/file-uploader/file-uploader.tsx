"use client";
import React, { SyntheticEvent, useEffect } from "react";
import styles from "./file-uploader.module.css";
import { ICartOrderElement } from "@/app/utils/types";
import { v4 as uuidv4 } from "uuid";
import { photoProcessing } from "@/app/utils/constructor-utils";
import { useAppSelector, useAppDispatch } from "@/redux/redux-hooks";
import { actions as constructorActions } from "@/redux/constructor-slice/constructor.slice";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useUploadPrintImageMutation } from "@/api/api";
import { setCoords } from "@/app/utils/constructor-utils";
import Link from "next/link";

const FileUploader: React.FC<{ orderElement: ICartOrderElement }> = ({
    orderElement,
}) => {
    //console.log(orderElement);
    const dispatch = useAppDispatch();
    const { order } = useAppSelector(store => store.cart);
    //console.log(order)
    const { isImageLoading, activeView } = useAppSelector(
        (store) => store.printConstructor
    );
    const { prints } = orderElement;
    // @ts-ignore
    const currentPrint = prints && prints[activeView];
    //console.log(currentPrint);

    const [ uploadPrint, print ] = useUploadPrintImageMutation();
    //console.log(print);






    const onChange = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(constructorActions.imageLoaderToggler());
        const data = new FormData();
        // @ts-ignore
        const print = photoProcessing(e.target.files[0]);
        if (print === undefined) {
            //dispatch(openPopup(['Не тот формат файла']));
        } else {            
            data.append("files", print, `${uuidv4()}_${print.name}`);           
            const uploadedPrint = await uploadPrint(data);
            //console.log(uploadPrint);
            // @ts-ignore
            uploadedPrint && dispatch(cartActions.setPrint({ print: uploadedPrint, activeView, itemCartId: orderElement.itemCartId, itemType: orderElement.item.type, itemColor: orderElement.item.color }));
            
            
            /* printUploadFunc - так-же вызывает ф-цию setCoords
                - которая задает позицию появления привью изображения */
            //dispatch(printUploadFunc(data, activeView, item.type, item.color));

        }
        dispatch(constructorActions.imageLoaderToggler());
        // @ts-ignore
        //e.target.reset();
    };

    const deletePrint = () => {
       dispatch(cartActions.deletePrint({ activeView, itemCartId: orderElement.itemCartId }))
    };

    return (
        <div className={styles.input_container}>
            <form
                className={styles.input_form}
                onChange={onChange}
                encType="multipart/form-data"
            >
                {/* isImageLoading */}
                <div className={styles.printInfo_wrapper}>
                    {isImageLoading && (
                        <div className={styles.loader_wrapper}>
                            <div
                                className={isImageLoading ? styles.loader_active : styles.loader}
                            >
                                <div className={styles.loader_icon} />
                            </div>
                        </div>
                    )}
                    {!isImageLoading && currentPrint && (
                        <p className={styles.printInfo}>{currentPrint.file?.name}</p>
                    )}
                </div>
               
               
                {!isImageLoading && currentPrint ? (
                    <div className={styles.printDeleteButton_wrapper}>
                        <button
                            type="button"
                            className={styles.print_delete_button}
                            onClick={deletePrint}
                        >
                        X
                        </button>
                    </div>
                ) : (
                    <div className={styles.input_wrapper}>
                        <input
                            type="file"
                            accept=".jpg, .png"
                            className={styles.file_input}
                            id="file_input"
                        />
                        <label htmlFor="file_input" className={styles.file_input_button}>
                            <p className={styles.file_input_button_text}>
                                Выберите файл
                            </p>
                        </label>
                    </div>
                )}
            </form>
            
        </div>
    );
};

export default FileUploader;
