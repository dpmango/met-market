import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';
import { useToasts } from 'react-toast-notifications';

import { SvgIcon, Button } from '@ui';
import { SessionStoreContext } from '@store';
import { isMobile, EVENTLIST, logEvent } from '@helpers';

import styles from './Footer.module.scss';

const Header = observer(({ className }) => {
  const { addToast } = useToasts();
  const emailRef = useRef(null);
  const { telegramLink, whatsappLink, cartNumber } = useContext(SessionStoreContext);

  const getEmail = useCallback(() => {
    const a = emailRef.current.getAttribute('data-start');
    const b = emailRef.current.getAttribute('data-end');

    if (cartNumber) {
      return `${a}+${cartNumber}@${b}`;
    } else {
      return `${a}@${b}`;
    }
  }, [emailRef, cartNumber]);

  const handleEmailClick = useCallback(
    (e) => {
      const email = getEmail();

      e.preventDefault();

      if (!isMobile()) {
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

      logEvent({ name: EVENTLIST.CLICK_EMAIL, params: { from: 'footer' } });
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
            <div className="col col-4 col-md-6 col-sm-12">
              <div className={styles.group}>
                <div className={cns(styles.footerTitle, styles._main)}>Отдел продаж</div>

                <a
                  href="tel:+74951043130"
                  className={styles.footerContact}
                  rel="noreferrer"
                  onClick={() => {
                    logEvent({ name: EVENTLIST.CLICK_PHONE, params: { from: 'footer' } });
                  }}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="phone" />
                  </div>
                  <span className="w-600">8-495-104-31-30</span>
                </a>
                <a
                  href={whatsappLink}
                  target="_blank"
                  className={styles.footerContact}
                  rel="noreferrer"
                  onClick={() => {
                    logEvent({ name: EVENTLIST.CLICK_WHATSAPP, params: { from: 'footer' } });
                  }}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="social-whatsapp" />
                  </div>
                  <span className="w-600">Whatsapp</span>
                </a>
                <a
                  href={telegramLink}
                  target="_blank"
                  className={styles.footerContact}
                  rel="noreferrer"
                  onClick={() => {
                    logEvent({ name: EVENTLIST.CLICK_TELEGRAM, params: { from: 'footer' } });
                  }}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="social-telegram" />
                  </div>
                  <span className="w-600">Telegram</span>
                </a>
                <a
                  href="#"
                  data-start="zakaz"
                  data-end="met.market"
                  className={cns(styles.footerContact, styles.email)}
                  onClick={handleEmailClick}
                  onMouseEnter={handleEmailHover}
                  ref={emailRef}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="email" />
                  </div>
                  <span>
                    <img src="/img/mail.svg" />
                  </span>
                </a>
                <div className={cns(styles.footerContact, styles.time)}>
                  <div className={cns(styles.footerContactIcon, styles._noalign)}>
                    <SvgIcon name="time" />
                  </div>
                  <span>
                    пн-чт: 08:00-17:00
                    <br />
                    пт: 08:00-15:00
                    <br />
                    сб-вс – выходной
                  </span>
                </div>
                <div
                  className={cns(styles.footerContact, styles.address)}
                  onMouseUp={() => {
                    logEvent({ name: EVENTLIST.CLICK_COMPANYADDRESS });
                  }}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="location" />
                  </div>
                  <span>г. Москва, ул. Автозаводская, 23Бк2</span>
                </div>
              </div>
            </div>

            <div className="col col-4 col-md-6 col-sm-12">
              <div className={cns(styles.group, styles._middle)}>
                <div className={styles.footerTitle}>Оформление заказа</div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="count-1" />
                  </div>
                  <span>Отправить заявку в отдел продаж</span>
                </div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="count-2" />
                  </div>
                  <span>Получить счет на оплату и договор поставки</span>
                </div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="count-3" />
                  </div>
                  <span>Товар будет отгружен на ваш объект за 24 часа</span>
                </div>
              </div>

              <div className={cns(styles.group, styles._midmd)}>
                <div className={styles.footerTitle}>Услуги</div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="service-cut" />
                  </div>
                  <span>Резка и рубка металла</span>
                </div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="service-24" />
                  </div>
                  <span>Круглосуточная доставка</span>
                </div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="service-transport" />
                  </div>
                  <span>Логистика и экспедирование груза</span>
                </div>
              </div>
            </div>

            <div className="col col-4 col-md-6 col-sm-12">
              <div className={cns(styles.group, styles._last)}>
                <div className={styles.footerTitle}>Услуги</div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="service-cut" />
                  </div>
                  <span>Резка и рубка металла</span>
                </div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="service-24" />
                  </div>
                  <span>Круглосуточная доставка</span>
                </div>
                <div className={styles.footerContact}>
                  <div className={styles.footerContactIcon}>
                    <SvgIcon name="service-transport" />
                  </div>
                  <span>Логистика и экспедирование груза</span>
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
            <span className={styles.footerBottomText} onMouseUp={() => logEvent({ name: EVENTLIST.CLICK_COMPANYNAME })}>
              ООО «МОНОЛИТСТРОЙ»
            </span>
            <span className={styles.footerBottomText} onMouseUp={() => logEvent({ name: EVENTLIST.CLICK_COMPANYINN })}>
              ИНН: 7743935769
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
});

export default Header;
