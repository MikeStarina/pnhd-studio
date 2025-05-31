'use client'
import { useEffect, useState } from 'react'
import styles from './cookie-bar.module.css'
import cookiePic from '../../../../public/cookie.jpg'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const routeConfig = ['/privacy', '/oferta'];

const CookieBar = () => {

    const [ isBarVisisble, setIsBarVisible ] = useState(false)
    const pathname = usePathname()
    const buttonClickHandler = () => {
        localStorage.setItem('COOKIE_AGREEMENT', 'AGREED')
        setIsBarVisible(false)
    }


    useEffect(() => {
        const cookieAgreement = localStorage.getItem('COOKIE_AGREEMENT');
        if (!cookieAgreement && !routeConfig.some(_ => _ === pathname)) {
            setIsBarVisible(true)
        } else {
            setIsBarVisible(false)
        }
    }, [pathname])

    return isBarVisisble && (
        <div className={styles.backdrop}>
            <div className={styles.bar}>
                <div className={styles.bar__imgWrapper}>
                    <Image src={cookiePic} alt='' />
                </div>
                <p className={styles.bar__title}>МЫ СОБИРАЕМ КУКИ!</p>
                <p className={styles.bar__text}>Мы понятия не имеем что с ними делать, но сообщать об этом теперь обязаны, окак! Юридическим языком написано <Link href='/privacy'>тут</Link></p>
                <button className={styles.bar__button} onClick={buttonClickHandler}>ПОНЯЛ, СОГЛАСЕН!</button>
            </div>
        </div>
    )
}

export default CookieBar;