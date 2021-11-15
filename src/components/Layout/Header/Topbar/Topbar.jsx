import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { SvgIcon } from '@ui';
import { UiStoreContext } from '@store';

import styles from './Topbar.module.scss';
import rootStyles from '../Header.module.scss';

const Topbar = observer(({ className }) => {
  const uiContext = useContext(UiStoreContext);

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
              className={cns(styles.topbarAction, styles.iconed, styles.price)}>
              <SvgIcon name="xls" />
              <span className="w-700">Прайс-лист</span>
            </a>
          </div>
          <div className={cns(rootStyles.colThrid, styles.topbarLinks)}>
            <a
              href="#"
              className={cns(styles.topbarAction)}
              onClick={(e) => {
                e.preventDefault();
                uiContext.setModal('callback');
              }}>
              <span className="w-700">Отправить заявку</span>
            </a>
            <a
              href="https://api.whatsapp.com/send/?phone=74951043130"
              target="_blank"
              className={cns(styles.topbarAction, styles.iconed)}
              rel="noreferrer">
              <SvgIcon name="social-whatsapp" />
              <span className="w-600">Whatsapp</span>
            </a>
            <a
              href="https://t.me/METMarket_bot"
              target="_blank"
              className={cns(styles.topbarAction, styles.iconed)}
              rel="noreferrer">
              <SvgIcon name="social-telegram" />
              <span className="w-600">Telegram</span>
            </a>
            <a href="tel:+74951043130" className={cns(styles.topbarAction)}>
              <span className="w-700">8-495-104-31-30</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Topbar;
