'use client';
import React from 'react';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './about.module.css';

const [lat, lon] = [59.972621, 30.306432];
const naviHref = `yandexnavi://build_route_on_map?lat_to=${lat}&lon_to=${lon}`;
// Запасной путь, если Навигатора нет: маршрут на машине в Яндекс Картах (на телефоне откроется приложение Карт, если оно есть)
const mapsRouteHref = `https://yandex.ru/maps/?rtext=~${lat},${lon}&rtt=auto`;

/**
 * «Проложить маршрут» — только на телефоне: открывает Яндекс Навигатор с маршрутом до студии.
 * Если приложение не открылось (страница осталась видимой), через секунду ведёт в Яндекс Карты.
 */
const RouteLink: React.FC = () => {
  const open = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const fallback = window.setTimeout(() => {
      if (!document.hidden) window.location.href = mapsRouteHref;
    }, 1000);
    document.addEventListener('visibilitychange', () => window.clearTimeout(fallback), { once: true });
    window.location.href = naviHref;
  };

  return (
    <a href={mapsRouteHref} className={styles.route} onClick={open}>
      Проложить маршрут&nbsp;<Icon name="arrowRight" size="1.25em" stroke={2} />
    </a>
  );
};

export default RouteLink;
