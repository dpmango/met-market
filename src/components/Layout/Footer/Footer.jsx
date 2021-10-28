import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';
import { useToasts } from 'react-toast-notifications';

import routes from '@config/routes';
import { SvgIcon, Button } from '@ui';
import { SessionStoreContext } from '@store';
import { isMobile } from '@helpers';

import styles from './Footer.module.scss';

const Header = observer(({ className }) => {
  const { addToast } = useToasts();
  const emailRef = useRef(null);
  const { sessionId, cartId, cartNumber } = useContext(SessionStoreContext);

  const getEmail = useCallback(() => {
    const a = emailRef.current.getAttribute('data-start');
    const b = emailRef.current.getAttribute('data-end');

    return `${a}@${b}`;
  }, [emailRef]);

  const handleEmailClick = useCallback(
    (e) => {
      const email = getEmail();

      e.preventDefault();

      if (isMobile()) {
        const el = document.createElement('textarea');
        el.value = email;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        addToast('Cкопировано в буфер обмена', { appearance: 'success' });
      } else {
        window.open(`mailto:${email}`);
      }
    },
    [emailRef]
  );

  const handleEmailHover = useCallback(() => {
    const email = getEmail();

    emailRef.current.setAttribute('href', `mailto:${email}`);
  }, [emailRef]);

  return (
    <footer className={cns(styles.footer, className)}>
      <div className={styles.footerMain}>
        <div className="container">
          <div className="row">
            <div className="col col-4 col-md-12">
              <div className={styles.group}>
                <div className={styles.footerTitle}>Отдел продаж</div>

                <a href="tel:+74951043130" className={styles.footerContact} rel="noreferrer">
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="phone" />
                  </div>
                  <span className="w-600">8-495-104-31-30</span>
                </a>
                <a
                  href="https://api.whatsapp.com/send/?phone=79584088908"
                  target="_blank"
                  className={styles.footerContact}
                  rel="noreferrer">
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="social-whatsapp" />
                  </div>
                  <span className="w-600">Whatsapp</span>
                </a>
                <a href="https://t.me/METMarket_bot" target="_blank" className={styles.footerContact} rel="noreferrer">
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="social-telegram" />
                  </div>
                  <span className="w-600">Telegram</span>
                </a>
                <a
                  href="#"
                  data-start="zakaz"
                  data-end="met.market"
                  className={styles.footerContact}
                  onClick={handleEmailClick}
                  onMouseEnter={handleEmailHover}
                  ref={emailRef}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="email" />
                  </div>
                  <span>
                    <img src="img/mail.svg" />
                  </span>
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
                  <span>
                    м. Южная, г. Москва, <br />
                    ул. Дорожная, д. 8, оф. 6
                  </span>
                </div>
              </div>
            </div>

            <div className="col col-4 col-md-12">
              <div className={cns(styles.group, styles._middle)}>
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
            </div>

            <div className="col col-4  col-md-12">
              <div className={cns(styles.group, styles._last)}>
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
