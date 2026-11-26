import React from 'react';
import { clients, type Client } from './data';
import styles from './clients.module.css';

const ROWS = 2;

// Клиенты делятся между рядами поровну: каждый логотип на стене один раз, без пустых плиток
const rows = Array.from({ length: ROWS }, (_, row) => clients.filter((_, i) => i % ROWS === row));

// Плитка 2:1. Ширина логотипа в долях плитки даёт всем логотипам одинаковую видимую площадь (10% плитки),
// длинные упираются в 78% ширины, высокие — в 62% высоты
const logoWidth = (ratio: number) => Math.min(0.78, 0.62 * 0.5 * ratio, Math.sqrt(0.1 * ratio));

const Tile: React.FC<{ client: Client }> = ({ client }) => (
  <li className={styles.tile}>
    {client.logo && (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={client.logo}
        alt={client.name}
        className={styles.logo}
        style={{ width: `${logoWidth(client.ratio ?? 2) * 100}%` }}
        loading="lazy"
      />
    )}
    {!client.logo && <span className={styles.name}>{client.name}</span>}
  </li>
);

/** Стена логотипов клиентов: два ряда бегущих плиток навстречу друг другу, при наведении не останавливается. */
const Clients: React.FC = () => (
  <div className={styles.wall} data-reveal aria-label="Клиенты Pinhead Studio" role="group">
    {rows.map((tiles, row) => (
      <div key={row} className={styles.row} data-row={row}>
        <ul className={styles.track}>
          {tiles.map((client) => (
            <Tile key={client.name} client={client} />
          ))}
        </ul>
        <ul className={styles.track} aria-hidden="true">
          {tiles.map((client) => (
            <Tile key={client.name} client={client} />
          ))}
        </ul>
      </div>
    ))}
  </div>
);

export default Clients;
