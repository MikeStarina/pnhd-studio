import React from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './more-link.module.css';

type Arrow = 'right' | 'upRight' | 'down';

const arrowIcon = { right: 'arrowRight', upRight: 'arrowUpRight', down: 'arrowDown' } as const;

// Стрелка говорит, куда ведёт кнопка: ↓ — к блоку на этой странице, ↗ — на другой сайт, → — на страницу сайта
const arrowFor = (href: string): Arrow => (href.startsWith('#') ? 'down' : /^https?:/.test(href) ? 'upRight' : 'right');

/**
 * Кнопка-переход сайта: таблетка с подписью и стрелкой в салатовом круге («Весь каталог», «Нанести принт»).
 * Цвета берёт от тона секции; `onDark` — для чёрной карточки на светлой секции, `onLime` — для салатовой
 * (круг белый: салатовый слился бы с фоном).
 * `size="l"` — главная кнопка блока, одна на блок. `stretch` — во всю ширину родителя: подпись слева, стрелка справа.
 * Внешняя ссылка открывается в новой вкладке.
 */
const MoreLink: React.FC<{
  href: string;
  size?: 'l';
  stretch?: boolean;
  onDark?: boolean;
  onLime?: boolean;
  children: React.ReactNode;
}> = ({ href, size, stretch, onDark, onLime, children }) => {
  const arrow = arrowFor(href);
  const icon = <Icon name={arrowIcon[arrow]} size={size === 'l' ? 24 : 16} stroke={2} />;
  const external = arrow === 'upRight';
  return (
    <Link
      href={href}
      className={styles.link}
      data-size={size}
      data-stretch={stretch || undefined}
      data-on-dark={onDark || undefined}
      data-on-lime={onLime || undefined}
      data-arrow={arrow}
      {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {children}
      {external && <span className="visually-hidden"> (откроется в новой вкладке)</span>}
      <span className={styles.arrow} aria-hidden="true">
        {icon}
      </span>
    </Link>
  );
};

export default MoreLink;
