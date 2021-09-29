import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import routes from '@config/routes';
import { SvgIcon, Button } from '@ui';
import { SessionStoreContext } from '@store';

import styles from './Header.module.scss';
import { ReactComponent as Logo } from '@assets/logo.svg';

const Header = observer(({ className }) => {
  const { sessionId, cartId, cartNumber } = useContext(SessionStoreContext);

  return (
    <header className={cns(styles.header, className)}>
      <div className={styles.topbar}>
        <div className="container">
          <div className={styles.topbarWrapper}>
            <div className={styles.colMain}>
              <a className={cns(styles.topbarAction, styles.location)}>
                <SvgIcon name="location" />
                <span>Москва</span>
              </a>
            </div>
            <div className={styles.colSecond}>
              <a className={cns(styles.topbarAction, styles.price)}>
                <SvgIcon name="pdf" />
                <span className="w-700">Прайс-лист</span>
              </a>
            </div>
            <div className={cns(styles.colThrid, styles.topbarLinks)}>
              <a className={cns(styles.topbarAction, styles.price)}>
                <span className="w-700">Отправить заявку</span>
              </a>
              <a href="https://whatsapp.com/" taget="_blank" className={cns(styles.topbarAction, styles.price)}>
                <SvgIcon name="social-whatsapp" />
                <span className="w-600">Whatsapp</span>
              </a>
              <a href="https://t.me/" taget="_blank" className={cns(styles.topbarAction, styles.price)}>
                <SvgIcon name="social-telegram" />
                <span className="w-600">Telegram</span>
              </a>
              <a className={cns(styles.topbarAction, styles.price)}>
                <span className="w-700">8-800-350-86-25</span>
              </a>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.main}>
        <div className="container">
          <div className={styles.wrapper}>
            <div className={styles.colMain}>
              <Link to="/">
                <Logo />
              </Link>
            </div>
            <div className={styles.colSecond}>
              <Button>Каталог</Button>
            </div>
            <div className={styles.colThrid}>Корзина: {cartNumber}</div>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
