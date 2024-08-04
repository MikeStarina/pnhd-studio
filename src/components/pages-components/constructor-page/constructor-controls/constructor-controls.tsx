'use client'
import React, { useEffect } from 'react';
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
    const [ uploadPrint ] = useUploadPrintImageMutation();

    useEffect(() => {
        const canvas = document.querySelector('canvas');
        const vid = document.querySelector('video');
        //const img: HTMLImageElement | null = document.querySelector('#gif');
        const link = document.querySelector('#share');
        var x = 0;
       
        previewMode && startRecording();
           
            function startRecording() {
                if(canvas) {
                    const chunks: Array<Blob> = []; // here we will store our recorded media chunks (Blobs)
                    const stream = canvas.captureStream(); // grab our canvas MediaStream
                    const rec = new MediaRecorder(stream); // init the recorder
                    // every time the recorder has new data, we will store it in our array
                    rec.ondataavailable = e => chunks.push(e.data);
                    // only when the recorder stops, we construct a complete Blob from all the chunks
                    rec.onstop = e => exportVid(new Blob(chunks, {type: 'video/mp4'}));
                    //rec.onstop = e => exportVid(new Blob(chunks, {type: 'image/gif'}));
                    rec.start();
                    setTimeout(()=>rec.stop(), 7250); // stop recording in 5s
                }
            }
            function exportVid(blob: Blob) {
                if (canvas && vid) {
                    const url = URL.createObjectURL(blob);
                    console.log(url);
                    vid.src = url;
                    //img.src = url;
                    //vid.controls = true;
                    //@ts-ignore
                    link.href = `https://t.me/share/url?url=${url}`
                    //@ts-ignore
                    link.textContent = 'Отправить (готово)'
                    // const a = document.createElement('a');
                    // a.download = 'myvid.webm';
                    // a.href = vid.src;
                    // a.textContent = 'download the video';
                    // document.body.appendChild(a);
                }
            }
         
    }, [previewMode])
   
  
    const test = () => {
        
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
                    <a id='share' href='/'>Отправить (не готово)</a>
                    <video autoPlay loop></video>
                    <img id='gif' src='/' alt='' />
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


