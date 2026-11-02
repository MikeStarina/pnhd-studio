"use client";
import React, { SyntheticEvent, useState } from "react";
import styles from "./file-uploader.module.css";
import { ICartOrderElement } from "@/app/utils/types";
import { v4 as uuidv4 } from "uuid";
import { photoProcessing } from "@/app/utils/constructor-utils";
import { printUploadFormData, readPrintUpload, rememberLocalPrint } from "@/app/utils/print-upload";
import { useAppSelector, useAppDispatch } from "@/redux/redux-hooks";
import { actions as constructorActions } from "@/redux/constructor-slice/constructor.slice";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useUploadPrintImageMutation } from "@/api/api";

const FileUploader: React.FC<{ orderElement: ICartOrderElement; dock?: boolean }> = ({
    orderElement,
    dock = false,
}) => {
    const dispatch = useAppDispatch();
    const { isImageLoading } = useAppSelector(
        (store) => store.printConstructor
    );
    const [ uploadPrint ] = useUploadPrintImageMutation();
    const [ uploadError, setUploadError ] = useState("");

    const onChange = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        const input = e.target instanceof HTMLInputElement ? e.target : null;
        const selected = input?.files?.[0];
        const print = selected ? photoProcessing(selected) : false;
        if (!print) {
            setUploadError("Нужен файл jpg или png");
            return;
        }
        setUploadError("");
        dispatch(constructorActions.imageLoaderToggler());
        try {
            const uploaded = readPrintUpload(await uploadPrint(printUploadFormData(print, `${uuidv4()}_${print.name}`)));
            if (!uploaded) {
                setUploadError("Не удалось загрузить файл");
                return;
            }
            rememberLocalPrint(uploaded.url, print);
            const id = uuidv4();
            dispatch(cartActions.setPrint({
                print: { data: uploaded },
                id,
                itemCartId: orderElement.itemCartId,
                itemType: orderElement.item.type,
                itemColor: orderElement.item.color,
            }));
            dispatch(constructorActions.setSelectedPrintId(id));
        } finally {
            dispatch(constructorActions.imageLoaderToggler());
            if (input) input.value = "";
        }
    };

    return (
        <div className={dock ? `${styles.input_container} ${styles.input_container_dock}` : styles.input_container}>
            <form
                className={styles.input_form}
                onChange={onChange}
                encType="multipart/form-data"
            >
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
                </div>
                {!isImageLoading && (
                    <div className={styles.input_wrapper}>
                        <input
                            type="file"
                            accept=".jpg, .png"
                            className={styles.file_input}
                            id="file_input"
                        />
                        <label htmlFor="file_input" className={styles.file_input_button}>
                            <p className={styles.file_input_button_text}>
                                Загрузить файл
                            </p>
                        </label>
                    </div>
                )}
            </form>
            {uploadError && <p className={styles.upload_error}>{uploadError}</p>}
        </div>
    );
};

export default FileUploader;
