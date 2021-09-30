import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import routes from '@config/routes';
import { SvgIcon, Button } from '@ui';
import { SessionStoreContext } from '@store';

import styles from './Footer.module.scss';

const Header = observer(({ className }) => {
  const { sessionId, cartId, cartNumber } = useContext(SessionStoreContext);

  return (
    <footer className={cns(styles.footer, className)}>
      <div className={styles.footerMain}>
        <div className="container">
          <div className="row">
            <div className="col col-4">
              <div className={styles.footerTitle}>Отдел продаж</div>

              <a href="tel:89266074688" className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="phone" />
                </div>
                <span className="w-600">8 (926) 607 46 88</span>
              </a>
              <a href="http://whatsup.com" className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="social-whatsapp" />
                </div>
                <span className="w-600">Whatsapp</span>
              </a>
              <a href="http://t.me" className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="social-telegram" />
                </div>
                <span className="w-600">Telegram</span>
              </a>
              <a href="mailto:info@met-market_shop.ru" className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="email" />
                </div>
                <span>info@met-market_shop.ru</span>
              </a>
              <div className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="time" />
                </div>
                <span>
                  пн-чт: 09:00-17:00
                  <br />
                  пт: 09:00-15:00
                  <br />
                  сб-вс – выходной
                </span>
              </div>
              <div className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="location" />
                </div>
                <span>м. Южная, г. Москва, ул. Дорожная, д. 8, оф. 6</span>
              </div>
            </div>

            <div className="col col-4">
              <div className={styles.footerTitle}>Склад в Ивантеевке</div>
              <div className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="time" />
                </div>
                <span>
                  Круглосуточная отгрузка:
                  <br />
                  доставка день в день
                </span>
              </div>
              <div className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="location" />
                </div>
                <span>
                  МО, г. Ивантеевка, <br />
                  ул. Железнодорожная, д. 1
                </span>
              </div>
            </div>

            <div className="col col-4">
              <div className={styles.footerTitle}>Склад в Люберцах</div>
              <div className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="time" />
                </div>
                <span>
                  Круглосуточная отгрузка:
                  <br />
                  доставка день в день
                </span>
              </div>
              <div className={styles.footerContact}>
                <div className={styles.footerContactIcon}>
                  <SvgIcon name="location" />
                </div>
                <span>
                  МО, г. Люберцы, <br />
                  ул. Проектируемый проезд 4296, д. 4
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <div className={styles.footerBottomWrapper}>
            <div className={styles.copyright}>
              <SvgIcon name="copyright" />
              <span>2021</span>
            </div>
            <span className={styles.footerBottomText}>ООО «МОНОЛИТСТРОЙ»</span>
            <span className={styles.footerBottomText}>ИНН: 7743935769</span>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Header;