'use client';
import React, { SyntheticEvent, useState } from 'react';
import { IProduct } from '@/app/utils/types';
import styles from './print-add-block.module.css'
import { v4 as uuidv4 } from 'uuid';
import { photoProcessing } from '@/app/utils/constructor-utils';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import { actions as utilActions } from '@/redux/utils-slice/utils.slice';
import { useUploadPrintImageMutation } from '@/api/api';
import { resolveMediaUrl } from '@/app/utils/product-photos';


const TABS = [
    { id: 'noPrint', name: 'Без принта' },
    { id: 'front', name: 'На груди' },
    { id: 'back', name: 'На спине' },
    { id: 'lsleeve', name: 'Левый рукав' },
    { id: 'rsleeve', name: 'Правый рукав' },
]

export const PrintAddBlock: React.FC<{ item: IProduct }> = ({ item }) => {
    const [tabState, setTabState] = useState<'noPrint' | 'front' | 'back' | 'lsleeve' | 'rsleeve'>('front');
    const dispatch = useAppDispatch();
    const { prints, isPrintImageLoading } = useAppSelector((store) => store.utils);
    const [uploadPrint] = useUploadPrintImageMutation();

    const currentPrint = tabState !== 'noPrint' ? prints?.[tabState] : undefined;
    const currentTab = TABS.find((tab) => tab.id === tabState);

    const onChange = async (e: SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (tabState === 'noPrint') return;
        dispatch(utilActions.printImageLoaderToggler());
        const data = new FormData();
        // @ts-ignore
        const print = photoProcessing(e.target.files[0]);
        if (print) {
            data.append('files', print, `${uuidv4()}_${print.name}`);
            const uploadedPrint = await uploadPrint(data);
            // @ts-ignore
            uploadedPrint && dispatch(utilActions.setPrint({ print: uploadedPrint, tab: tabState, itemType: item.type, itemColor: item.color }));
        }
        dispatch(utilActions.printImageLoaderToggler());
    };

    const deletePrint = () => {
        if (tabState === 'noPrint') return;
        dispatch(utilActions.deletePrintTab({ tab: tabState }));
    };

    return (
        <div className={styles.block}>
            <span>Принт</span>
            <div className={styles.tabs}>
                {TABS.map((tab) => {
                    const isActive = tabState === tab.id;
                    return (
                        <button key={tab.id} className={isActive ? `${styles.tab} ${styles.tab_active}` : styles.tab} onClick={() => setTabState(tab.id as 'noPrint' | 'front' | 'back' | 'lsleeve' | 'rsleeve')}>
                            {tab.name}
                        </button>
                    )
                })}
            </div>
            {tabState !== 'noPrint' && (
                <>
                    <div className={styles.block__uploader}>
                        <div className={styles.input_container}>
                            <form
                                className={styles.input_form}
                                onChange={onChange}
                                encType="multipart/form-data"
                            >
                                {!isPrintImageLoading && !currentPrint && (
                                    <div className={styles.printInfo_wrapper}>
                                        <span className={styles.printInfo_arrow}>&uarr;</span>
                                        <p className={styles.printInfo_text}>{currentTab?.name}</p>
                                        <span className={styles.printInfo_note} style={{ color: 'black' }}>Клик чтобы загрузить файл</span>
                                        <span className={styles.printInfo_note}>.png/.jpg/.svg, до 10Мб</span>
                                    </div>)}
                                {isPrintImageLoading && (
                                    <div className={styles.loader_wrapper}>
                                        <div className={styles.loader_active}>
                                            <div className={styles.loader_icon} />
                                        </div>
                                    </div>
                                )}
                                {!isPrintImageLoading && currentPrint && (
                                    <div className={styles.printInfo_wrapper}>
                                        <div className={styles.printInfo_image}>
                                            <img src={resolveMediaUrl(currentPrint.file?.url)} alt={currentPrint.file?.name} />
                                        </div>
                                        <span className={styles.printInfo_note} style={{ color: 'black' }}>{currentPrint.file?.name}</span>
                                        <div className={styles.printDeleteButton_wrapper}>
                                            <button
                                                type="button"
                                                className={styles.print_delete_button}
                                                onClick={deletePrint}
                                            >
                                                X
                                            </button>
                                        </div>
                                    </div>)}
                                <input
                                    type="file"
                                    accept=".jpg, .png"
                                    className={styles.file_input}
                                    id={`print_add_file_input_${tabState}`}
                                />
                                {/* {!isPrintImageLoading && currentPrint ? (
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

                                <input
                                    type="file"
                                    accept=".jpg, .png"
                                    className={styles.file_input}
                                    id={`print_add_file_input_${tabState}`}
                                />
                            )} */}
                            </form>
                        </div>
                    </div>
                    <span className={styles.alert}>
                        Точное расположение и размеры уточнит наш менеджер после .<br />
                        Контакты для связи можно указать на следующем шаге.
                    </span>
                </>
            )}
        </div>
    );
};
