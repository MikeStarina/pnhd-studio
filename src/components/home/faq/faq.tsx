import Link from 'next/link'
import MarkupScript from '@/components/shared-components/markup-script/markup-script'
import Section from '../section/section'
import SectionHead from '../section-head/section-head'
import FaqList from './faq-list'
import { faqItems, faqJsonLd, type FaqItem } from './data'
import styles from './faq.module.css'

/** Вопросы по умолчанию — общие, с главной; страницы разделов передают свои. */
const Faq: React.FC<{
  items?: FaqItem[]
  ctaHref?: string
}> = ({ items = faqItems, ctaHref = '#price' }) => (
  <Section tone="white" id="faq" labelledBy="faq-title">
    <MarkupScript jsonLd={faqJsonLd(items)} />
    <div className={styles.grid} data-reveal-group>
      <div className={styles.side}>
        <SectionHead
          titleId="faq-title"
          title={
            <>
              Частые
              <br />
              вопросы
            </>
          }
        />
        <p className={styles.note}>Остались вопросы? Напиши менеджеру&nbsp;— ответим лично</p>
        {ctaHref.startsWith('#') ? (
          <a href={ctaHref} className={styles.cta}>
            Написать менеджеру
          </a>
        ) : (
          <Link href={ctaHref} className={styles.cta}>
            Написать менеджеру
          </Link>
        )}
      </div>
      <FaqList items={items} />
    </div>
  </Section>
)

export default Faq
