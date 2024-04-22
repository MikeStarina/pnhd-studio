'use client'
import React, { useEffect, useState } from "react";
import { useRouter, redirect } from "next/navigation";
import styles from './page.module.css';






const Page: React.FC<{ searchParams: { [n: string]: string }}> = ({ searchParams }) => {

    const [ counter, setCounter ] = useState(5)

    const router = useRouter();
    useEffect(() => {
        if (!searchParams.from || searchParams.from !== 'checkout') router.push('/');
        const interval = setInterval(() => {
            if(counter === 0) return router.push('/');
            setCounter(counter - 1);
        }, 1000)

        return () => {
            clearInterval(interval)
        }
    }, [counter])

    return (
        <section className={styles.page}>
        {searchParams.from && searchParams.from === 'checkout' &&
            <div className={styles.wrapper}>
                <h1 className={styles.title}>СПАСИБО!</h1>
                <p className={styles.text}>
                    Мы свяжемся с вами в течении 15 минут — подтвердим заказ и пришлем ссылку на оплату UwU, а пока перенаправми вас на главную через {counter} секунд.
                </p>
            </div>
        }
        </section>
    )
}

export default Page;