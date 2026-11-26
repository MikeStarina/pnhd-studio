import { constructorHref } from '@/components/site/links';
import Section from '../section/section';
import SectionHead from '../section-head/section-head';
import CornerStar from '../corner-star/corner-star';
import ConstructorLive from './constructor-live';
import styles from './constructor-promo.module.css';

const ConstructorPromo: React.FC = () => (
  <Section tone="black" id="constructor" labelledBy="constructor-title" decor={<CornerStar />}>
    <div className={styles.fit}>
      <SectionHead
        titleId="constructor-title"
        title={<>Нанеси принт за&nbsp;4&nbsp;шага</>}
      />
      <ConstructorLive href={constructorHref} />
    </div>
  </Section>
);

export default ConstructorPromo;
