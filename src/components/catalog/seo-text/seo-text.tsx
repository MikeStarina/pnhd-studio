import Section from '@/components/home/section/section';
import styles from './seo-text.module.css';

/** SEO-текст раздела: отдельная белая секция, колонка читаемой ширины. Разметка текста — обычные h2, p, ol внутри. */
const SeoText: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <Section tone="white">
    <div className={styles.prose}>{children}</div>
  </Section>
);

export default SeoText;
