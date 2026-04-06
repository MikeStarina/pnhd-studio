import React from 'react'
import Link from 'next/link'
import styles from './loyalty-banner.module.css'

const LoyaltyBanner: React.FC = () => {
    return (
        <Link href='/loyalty' className={styles.banner}>
            <div className={styles.banner_left}>
                <p className={styles.banner_eyebrow}>Программа лояльности Pinhead Studio</p>
                <p className={styles.banner_title}>Оплачивайте до 50%<br />заказа бонусами</p>
            </div>
            {/* <div className={styles.banner_right}>
                <div className={styles.card}>
                    <div className={styles.card_header}>
                        <span className={styles.card_brand}>pinhead studio</span>
                        <span className={styles.card_balance}>Баланс 500 ✦</span>
                    </div>
                    <p className={styles.card_rate}>1 бонус = 1 ₽</p>
                </div>
            </div> */}
        </Link>
    )
}

export default LoyaltyBanner
