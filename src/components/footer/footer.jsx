import React from 'react';
// import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import styles from './footer.module.css';
import PayCardsLabel from '../../ui/icons/pay-cards-label';
// import Vk from '../../ui/icons/vk';
// import Telegram from '../../ui/icons/telegram';
import footerData from '../../data/footer/data';
// import { telegram, vkontakte } from '../../utils/constants';

function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      {footerData.map((item) => (
        <div
          className={styles.item_block}
          style={{ gridArea: item.styles }}
          key={item.id}
        >
          <p className={styles.block_menu}>{item.name}</p>
          <ul className={styles.block_info}>
            {item.list.map((element) => (
              <li key={element.id}>
                <HashLink
                  to={element.link}
                  target={element.target}
                  className={styles.info_link}
                >
                  {element.type}
                </HashLink>
              </li>
            ))}
          </ul>
        </div>
      ))}
      <div className={styles.block_label}>
        <PayCardsLabel />
        <p className={styles.label_info}>ООО “ПИНХЭД СТУДИО”</p>
        <p className={styles.label_info}>ИНН: 7810463916</p>
        <p className={styles.label_info}>ОГРН: 1137847215440</p>
        {/*
        <div>
          <Link
            to={{ pathname: vkontakte }}
            className={styles.social_link}
            target="blank"><Vk
            className={styles.social}
          />
          <Link
          to={{ pathname: telegram }}
          className={styles.social_link}
          target="blank"><Telegram className={styles.social} /></Link>
        </div>
            */}
      </div>
      <div className={styles.block_sign}>
        <p className={styles.sign_text}>MERCH AGAINST THE MACHINES!</p>
        <p className={styles.sign_text}>PINHEAD STUDIO 2023</p>
      </div>
    </footer>
  );
}

export default Footer;
