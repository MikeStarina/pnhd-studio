import React from 'react';
import Link from 'next/link';
import { Metadata } from 'next';
import { contactsHref } from '@/components/site/links';
import { Icon } from '@/features/constructor/ui/icons';
import Breadcrumbs from '@/components/shared-components/breadcrumbs/Breadcrumbs';
import Section from '@/components/home/section/section';
import SectionHead from '@/components/home/section-head/section-head';
import Facts, { type Fact } from '@/components/home/facts/facts';
import styles from './page.module.css';

const BOT_HREF = 'https://telegram.me/pnhd_bonus_bot';

export const metadata: Metadata = {
  title: 'Программа лояльности Pinhead Studio — бонусы за заказы',
  description:
    'Программа лояльности Пинхэд Студии: накапливай бонусы за каждый заказ и оплачивай до 50% стоимости. 500 бонусов после регистрации. Кешбэк до 10%.',
  keywords: 'программа лояльности, бонусы, кешбэк, печать на одежде, скидки, Pinhead Studio',
  metadataBase: new URL('https://studio.pnhd.ru'),
  alternates: {
    canonical: '/loyalty',
  },
  openGraph: {
    type: 'website',
    title: 'Программа лояльности Pinhead Studio',
    images: '/opengraph-image.jpg',
  },
};

const facts: Fact[] = [
  { value: '500', unit: 'бонусов', text: 'после регистрации — потратишь их на следующий заказ', highlight: true },
  { prefix: 'до', value: '50%', text: 'стоимости заказа можно оплатить бонусами' },
  { prefix: 'до', value: '10%', text: 'кешбэк — чем больше печатаешь, тем он выше' },
  { value: '1 ₽', text: 'стоит один бонус' },
];

const levels = [
  { level: 'Уровень 1', sum: 'до 3 000 ₽', cashback: null },
  { level: 'Уровень 2', sum: 'от 3 000 ₽', cashback: '3%' },
  { level: 'Уровень 3', sum: 'от 10 000 ₽', cashback: '5%' },
  { level: 'Уровень 4', sum: 'от 30 000 ₽', cashback: '7%' },
  { level: 'Уровень 5', sum: 'от 100 000 ₽', cashback: '10%' },
];

/** Способы вступить — равные варианты на выбор, а не шаги по порядку: без номеров и стрелок */
const joinWays = [
  { icon: 'qrCode', title: 'QR-код в студии', text: <>Отсканируй код в&nbsp;студии на&nbsp;Чапыгина, 1&nbsp;— и&nbsp;ты в&nbsp;программе</> },
  { icon: 'telegram', title: 'Telegram-бот', text: <>Зарегистрируйся в&nbsp;боте за&nbsp;минуту и&nbsp;следи за&nbsp;бонусами</>, href: BOT_HREF },
  { icon: 'support', title: 'Администратор', text: <>Попроси администратора&nbsp;— он зарегистрирует тебя на&nbsp;месте</> },
] as const;

/** Условия — по одной мысли на карточку. Приветственные бонусы и пороги уровней уже есть выше — здесь не повторяем */
const terms: { title: string; text: React.ReactNode }[] = [
  { title: 'Начисление', text: <>После оплаты каждого заказа, по&nbsp;твоему уровню. Обычно сразу, иногда до&nbsp;24&nbsp;часов</> },
  { title: 'Списание', text: <>До&nbsp;50% заказа. Назови номер телефона и&nbsp;скажи администратору, что хочешь списать бонусы</> },
  { title: 'Уровень', text: <>Растёт сам, когда сумма заказов доходит до&nbsp;порога. Новые клиенты начинают с&nbsp;первого</> },
  { title: 'Срок действия', text: <>Бонусы действуют ограниченное время. Срок зависит от&nbsp;типа бонусов и&nbsp;условий акции</> },
  { title: 'Ограничения', text: <>Бонусы не&nbsp;меняются на&nbsp;деньги и&nbsp;не&nbsp;передаются. При возврате заказа их могут списать</> },
  {
    title: 'Не видно бонусов',
    text: (
      <>
        Проверь номер телефона,{' '}
        <a href={BOT_HREF} target="_blank" rel="noopener noreferrer" className={styles.inlineLink}>
          войди в&nbsp;бота заново
          <span className="visually-hidden"> (откроется в новой вкладке)</span>
        </a>{' '}
        или спроси администратора
      </>
    ),
  },
];

const Crumbs = () => (
  <div className={styles.crumbs}>
    <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Бонусы', href: '/loyalty' }]} />
  </div>
);

const Page: React.FC = () => (
  <div data-layout="wide" data-inner-page>
    <Section tone="white" labelledBy="loyalty-title">
      <Crumbs />
      <SectionHead
        as="h1"
        titleId="loyalty-title"
        title={<>Оплачивай до&nbsp;50% заказа бонусами</>}
        lead="Ты делаешь заказы — мы возвращаем часть суммы бонусами. Чем больше печатаешь, тем выше кешбэк"
      />
      <Facts items={facts} />
      <div className={styles.cta} data-reveal>
        <a href={BOT_HREF} target="_blank" rel="noopener noreferrer" className={styles.button}>
          Зарегистрироваться в боте
          <span className="visually-hidden"> (откроется в новой вкладке)</span>
        </a>
      </div>
    </Section>

    <Section tone="black" id="levels" labelledBy="levels-title">
      <SectionHead
        titleId="levels-title"
        title="Уровни программы"
        lead="Уровни копятся: чем выше уровень — тем выгоднее каждый следующий заказ"
      />
      <ul className={styles.levels} data-reveal-group>
        {levels.map(({ level, sum, cashback }) => (
          <li key={level} className={styles.level}>
            <p className={styles.levelName}>{level}</p>
            <p className={styles.levelSum}>{sum}</p>
            {cashback ? (
              <p className={styles.levelCashback}>
                {cashback}
                <span className={styles.levelUnit}>кешбэк</span>
              </p>
            ) : (
              <p className={styles.levelBase}>без кешбэка</p>
            )}
          </li>
        ))}
      </ul>
    </Section>

    <Section tone="white" id="join" labelledBy="join-title">
      <SectionHead
        titleId="join-title"
        title="Как вступить"
        lead="Если у тебя уже есть карта лояльности — ты в системе. Остальным — любой из трёх способов"
      />
      <ul className={styles.ways} data-reveal-group>
        {joinWays.map((way) => (
          <li key={way.title} className={styles.way}>
            <span className={styles.wayIcon} aria-hidden="true">
              <Icon name={way.icon} size={24} />
            </span>
            <h3 className={styles.wayTitle}>{way.title}</h3>
            <p className={styles.wayText}>{way.text}</p>
            {'href' in way && (
              <a href={way.href} target="_blank" rel="noopener noreferrer" className={styles.wayLink}>
                Открыть бота
                <Icon name="arrowUpRight" size="1.25em" />
                <span className="visually-hidden"> (откроется в новой вкладке)</span>
              </a>
            )}
          </li>
        ))}
      </ul>
    </Section>

    <Section tone="black" id="terms" labelledBy="terms-title">
      <SectionHead titleId="terms-title" title="Условия" lead="Коротко о том, как бонусы приходят, тратятся и сгорают" />
      <ul className={styles.terms} data-reveal-group>
        {terms.map(({ title, text }) => (
          <li key={title} className={styles.term}>
            <h3 className={styles.termTitle}>{title}</h3>
            <p className={styles.termText}>{text}</p>
          </li>
        ))}
      </ul>
    </Section>

    <Section tone="white" id="support" labelledBy="support-title">
      <SectionHead
        titleId="support-title"
        title="Поддержка"
        lead="Остались вопросы — спроси администратора Пинхэд Студии, поможем разобраться"
      />
      <div className={styles.actions} data-reveal>
        <a href={BOT_HREF} target="_blank" rel="noopener noreferrer" className={styles.button}>
          Telegram-бот
          <span className="visually-hidden"> (откроется в новой вкладке)</span>
        </a>
        <Link href={contactsHref} className={styles.buttonGhost}>
          Контакты
        </Link>
      </div>
    </Section>
  </div>
);

export default Page;
