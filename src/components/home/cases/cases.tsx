import Image from 'next/image'
import { cases } from './data'
import styles from './cases.module.css'

/**
 * Карточки кейсов. На главной — первые три, на телефоне лентой; на странице /cases — все, сеткой.
 * Появляются веером (data-reveal-group="fan").
 */
const Cases: React.FC<{ limit?: number; layout?: 'strip' | 'grid' }> = ({ limit, layout = 'strip' }) => (
  <ul className={styles.list} data-layout={layout} data-reveal-group="fan">
    {cases.slice(0, limit).map((item) => (
      <li key={item.id} className={styles.card}>
        <div className={styles.photo}>
          <Image src={item.image} alt={item.alt} fill sizes="(max-width: 599px) 90vw, (max-width: 1023px) 50vw, 33vw" className={styles.image} />
        </div>
        <h3 className={styles.name}>{item.title}</h3>
        <p className={styles.text}>{item.description}</p>
      </li>
    ))}
  </ul>
)

export default Cases
