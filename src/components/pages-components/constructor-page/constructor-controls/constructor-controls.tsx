'use client'
import React, { useState } from 'react';
import styles from './constructor-controls.module.css';
import FileUploader from '../file-uploader/file-uploader';
import { ICartOrderElement } from '@/app/utils/types';
import OrderInfo from '../order-info/order-info';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/redux/redux-hooks';
import { actions as constructorActions } from '@/redux/constructor-slice/constructor.slice';
import { useAppDispatch } from '@/redux/redux-hooks';



const Controls: React.FC<{ itemCartId: any}> = ({ itemCartId }) => {
    const { order } = useAppSelector((store) => store.cart);
    const { previewMode } = useAppSelector((store) => store.printConstructor);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    const dispatch = useAppDispatch();
    const router = useRouter();
    const goToCart = () => {
        if (!orderElement) return;
        router.push('/cart');
    };
    const [collapsed, setCollapsed] = useState(false);
    const [ createVideoState, setCreateVideoState ] = useState({
        inProgress: false,
        isVideoReady: false,
        text: 'Записать видео'
    })


  
    const createVideo = () => {
        setCreateVideoState({
            isVideoReady: false,
            inProgress: true,
            text: 'Запись...'
        })
        const canvas = document.querySelector('canvas');
        const link: HTMLLinkElement | null = document.querySelector('#share');
        
       
        previewMode && startRecording();
           
            function startRecording() {
                if(canvas) {
                    const chunks: Array<Blob> = [];
                    const stream = canvas.captureStream();
                    const rec = new MediaRecorder(stream);
                    rec.ondataavailable = e => chunks.push(e.data);
                    rec.onstop = e => exportVid(new Blob(chunks, {type: 'video/mp4'}));
                    rec.start();
                    setTimeout(()=>rec.stop(), 6000);
                }
            }
            function exportVid(blob: Blob) {
                if (link) {
                    setCreateVideoState({
                        inProgress: false,
                        isVideoReady: true,
                        text: 'Записать видео'
                    })
                    const url = URL.createObjectURL(blob);
                    //@ts-ignore
                    link.download = 'video.mp4';
                    link.href = url;
                }
            }
    }
    if (!orderElement) return null;

    if (collapsed) {
        return (
            <button type="button" className={styles.panel_toggle} onClick={() => setCollapsed(false)}>
                Панель
            </button>
        );
    }

    return (
            <div className={styles.dock}>
                <button type="button" className={`${styles.collapse} ${styles.text_button}`} onClick={() => setCollapsed(true)}>
                    Свернуть
                </button>
                <OrderInfo orderElement={orderElement} dock />
                <div className={styles.dock_row}>
                    <button type="button" className={!previewMode ? `${styles.text_button} ${styles.text_button_active}` : styles.text_button} onClick={() => {dispatch(constructorActions.setPreviewMode(false))}}>Редактор</button>
                    <button type="button" className={previewMode ? `${styles.text_button} ${styles.text_button_active}` : styles.text_button} onClick={() => {dispatch(constructorActions.setPreviewMode(true))}}>Превью</button>
                </div>
                {previewMode &&
                    <div className={styles.dock_row}>
                        <button
                            disabled={createVideoState.inProgress}
                            type="button"
                            onClick={createVideo}
                            className={styles.text_button}
                        >
                            {createVideoState.text}
                        </button>
                        <a href="/" id="share" aria-disabled={!createVideoState.isVideoReady} style={{ textDecoration: "none" }}>
                            <button disabled={!createVideoState.isVideoReady} className={styles.text_button} type="button">
                                Скачать
                            </button>
                        </a>
                    </div>
                }
                {!previewMode &&
                    <div className={styles.dock_row}>
                        <FileUploader orderElement={orderElement} dock />
                        <Link className={styles.link} href="/howto" target="blank">Как использовать</Link>
                    </div>
                }
                <button
                    type="button"
                    className={styles.text_button}
                    onClick={goToCart}
                >
                    В корзину
                </button>
            </div>
    )
}

export default Controls;


