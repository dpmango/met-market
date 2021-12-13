import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { SvgIcon } from '@ui';
import { UiStoreContext, SessionStoreContext } from '@store';
import { EVENTLIST, logEvent } from '@helpers';
import { useEmailHook } from '@hooks';

import styles from './Topbar.module.scss';
import rootStyles from '../Header.module.scss';

const Topbar = observer(({ className }) => {
  const uiContext = useContext(UiStoreContext);
  const { telegramLink, whatsappLink } = useContext(SessionStoreContext);

  const emailHook = useEmailHook('header');

  return (
    <div className={styles.topbar}>
      <div className="container">
        <div className={styles.topbarWrapper}>
          <div className={rootStyles.colMain}>
            <a className={cns(styles.topbarAction, styles.location)}>
              <SvgIcon name="location" />
              <span>Москва</span>
            </a>
          </div>
          <div className={cns(rootStyles.colSecond, styles.colSecond)}>
            <a
              href="/met.market.xlsx"
              target="_blank"
              className={cns(styles.topbarAction, styles.iconed, styles.price)}
              onClick={() => logEvent({ name: EVENTLIST.CLICK_PRICELIST })}>
              <SvgIcon name="xls" />
              <span className="w-700">Прайс-лист</span>
            </a>
          </div>
          <div className={cns(rootStyles.colThrid, styles.topbarLinks)}>
            <a
              href="#"
              className={cns(styles.topbarAction, styles.rfq)}
              onClick={(e) => {
                e.preventDefault();
                uiContext.setModal('callback');
                logEvent({ name: EVENTLIST.CLICK_OPENFORM_RFQ, params: { from: 'header' } });
              }}>
              <span className="w-700">Отправить заявку</span>
            </a>
            <a
              href="#"
              data-start="zakaz"
              data-end="met.market"
              className={cns(styles.topbarAction, styles.iconed, styles.email)}
              onClick={emailHook.handleEmailClick}
              onMouseEnter={emailHook.handleEmailHover}
              ref={emailHook.emailRef}>
              <SvgIcon name="social-email" key="email" />
              <span>
                <img src="/img/mail-white.svg" />
              </span>
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              className={cns(styles.topbarAction, styles.iconed)}
              rel="noreferrer"
              onClick={() => {
                logEvent({ name: EVENTLIST.CLICK_WHATSAPP, params: { from: 'header' } });
              }}>
              <SvgIcon name="social-whatsapp" key="whatsapp" />
              <span className="w-600">Whatsapp</span>
            </a>
            <a
              href={telegramLink}
              target="_blank"
              className={cns(styles.topbarAction, styles.iconed)}
              rel="noreferrer"
              onClick={() => {
                logEvent({ name: EVENTLIST.CLICK_TELEGRAM, params: { from: 'header' } });
              }}>
              <SvgIcon name="social-telegram" key="telegram" />
              <span className="w-600">Telegram</span>
            </a>
            <a
              href="tel:+74951043130"
              className={cns(styles.topbarAction)}
              onClick={() => {
                logEvent({ name: EVENTLIST.CLICK_PHONE, params: { from: 'header' } });
              }}>
              <span className="w-700">8-495-104-31-30</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Topbar;
