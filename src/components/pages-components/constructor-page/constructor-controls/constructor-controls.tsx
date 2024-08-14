'use client'
import React, { useEffect, useState } from 'react';
import styles from './constructor-controls.module.css';
import Tabs from '../tabs/tabs';
import FileUploader from '../file-uploader/file-uploader';
import { ICartOrderElement } from '@/app/utils/types';
import OrderInfo from '../order-info/order-info';
import Link from 'next/link';
import { useAppSelector } from '@/redux/redux-hooks';
import { actions as constructorActions } from '@/redux/constructor-slice/constructor.slice';
import { useAppDispatch } from '@/redux/redux-hooks';
import { useUploadPrintImageMutation } from '@/api/api';



const Controls: React.FC<{ itemCartId: any}> = ({ itemCartId }) => {
    const { order } = useAppSelector((store) => store.cart);
    const { previewMode } = useAppSelector((store) => store.printConstructor);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    const dispatch = useAppDispatch();
    const clickHandler = () => {
        dispatch(constructorActions.setActiveView('front'));
    }
    const [ createVideoState, setCreateVideoState ] = useState({
        inProgress: false,
        isVideoReady: false,
        text: 'Записать видео'
    })

    console.log(createVideoState)

  
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
    return (
        <>
        {orderElement && 
            <>
            <div className={styles.controls_container}>
                <div className={styles.controls_previewControlsWrapper}>
                    <button type='button' className={!previewMode ? styles.active_tab : styles.tab} onClick={() => {dispatch(constructorActions.setPreviewMode())}}>Редактор</button>
                    <button type='button' className={previewMode ? styles.active_tab : styles.tab} onClick={() => {dispatch(constructorActions.setPreviewMode())}}>Превью</button>
                </div>
                
                {!previewMode && 
                    <>
                        <Tabs orderElement={orderElement} />
                        <FileUploader orderElement={orderElement} />
                        <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', margin: '10px 0 0 0'}}>
                            <Link className={styles.link} href='/howto' target='blank'>Как использовать конструктор ?</Link>
                        </div>
                    </>
                }
                {previewMode &&
                    <div className={styles.preview_container}>
                        <button
                            disabled={createVideoState.inProgress}
                            type='button'
                            onClick={createVideo}
                            className={styles.preview_createVideoButton}
                        >
                            {createVideoState.text}
                        </button>
                        <a href='/' id='share'aria-disabled={!createVideoState.isVideoReady} style={{ textDecoration: 'none'}}>
                        <button disabled={!createVideoState.isVideoReady} className={styles.preview_downloadButton}>
                            Скачать
                        </button>
                        </a>
                    </div>
                    
                }
                <OrderInfo orderElement={orderElement} />

            <Link href='/cart' style={{ alignSelf: 'flex-end', marginTop: '50px'}} onClick={clickHandler}>
                <button
                    type='button'
                    className={styles.controls_cartButton}
                >
                    в корзину
                </button>
            </Link>
        </div>
        </>
    }
    </>
    )
}

export default Controls;


