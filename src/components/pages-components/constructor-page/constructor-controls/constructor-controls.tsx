'use client'
import React from 'react';
import styles from './constructor-controls.module.css';
import Tabs from '../tabs/tabs';
import FileUploader from '../file-uploader/file-uploader';
import { ICartOrderElement } from '@/app/utils/types';
import OrderInfo from '../order-info/order-info';
import Link from 'next/link';
import { useAppSelector } from '@/redux/redux-hooks';
import { actions as constructorActions } from '@/redux/constructor-slice/constructor.slice';
import { useAppDispatch } from '@/redux/redux-hooks';



const Controls: React.FC<{ itemCartId: any}> = ({ itemCartId }) => {
    const { order } = useAppSelector((store) => store.cart);
    const { previewMode } = useAppSelector((store) => store.printConstructor);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    const dispatch = useAppDispatch();
    const clickHandler = () => {
        dispatch(constructorActions.setActiveView('front'));
    }
    const videoRef = React.useRef(null)
    const test = () => {
        const mediaSource = new MediaSource();
        let sourceBuffer;
        mediaSource.addEventListener('sourceopen', handleSourceOpen, false);
        const canvas = document.querySelector('canvas');
        const video = document.querySelector('video');
        let recordedBlobs = [];

        function handleSourceOpen(event) {
            console.log('MediaSource opened');
            sourceBuffer = mediaSource.addSourceBuffer('video/webm; codecs="vp8"');
            console.log('Source buffer: ', sourceBuffer);
          }
        function handleDataAvailable(event) {
            if (event.data && event.data.size > 0) {
              recordedBlobs.push(event.data);
            }
        }
        function handleStop(event) {
            console.log('Recorder stopped: ', event);
            const superBuffer = new Blob(recordedBlobs, {type: 'video/avi'});
            video.src = window.URL.createObjectURL(superBuffer);
            console.log(window.URL.createObjectURL(superBuffer))
            //navigator.share(superBuffer);
            recordedBlobs = [];
        }



        const stream = canvas?.captureStream();
        let options = {mimeType: 'video/webm'};
        let mediaRecorder = new MediaRecorder(stream, options);
        mediaRecorder.onstop = handleStop;
        mediaRecorder.ondataavailable = handleDataAvailable;
        mediaRecorder.start(1000);

        const timeout = setTimeout(() => {mediaRecorder.stop()}, 5000);

       
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
                    <>
                    <button type='button' onClick={test}>Поделиться</button>
                    <video autoPlay loop></video>
                    
                    </>
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


