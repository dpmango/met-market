import React from 'react';
import cns from 'classnames';

import { SvgIcon } from '@ui';

import styles from './Topbar.module.scss';
import rootStyles from '../Header.module.scss';

const Topbar = ({ className }) => {
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
          <div className={rootStyles.colSecond}>
            <a href="/catalog.pdf" target="_blank" className={cns(styles.topbarAction, styles.price)}>
              <SvgIcon name="pdf" />
              <span className="w-700">Прайс-лист</span>
            </a>
          </div>
          <div className={cns(rootStyles.colThrid, styles.topbarLinks)}>
            <a className={cns(styles.topbarAction, styles.price)}>
              <span className="w-700">Отправить заявку</span>
            </a>
            <a
              href="https://whatsapp.com/"
              target="_blank"
              className={cns(styles.topbarAction, styles.price)}
              rel="noreferrer">
              <SvgIcon name="social-whatsapp" />
              <span className="w-600">Whatsapp</span>
            </a>
            <a href="https://t.me/" target="_blank" className={cns(styles.topbarAction, styles.price)} rel="noreferrer">
              <SvgIcon name="social-telegram" />
              <span className="w-600">Telegram</span>
            </a>
            <a href="tel:88003508625" className={cns(styles.topbarAction, styles.price)}>
              <span className="w-700">8-800-350-86-25</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Topbar;
