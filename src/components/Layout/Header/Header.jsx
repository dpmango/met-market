import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { SvgIcon, Button } from '@ui';
import { SessionStoreContext, CartStoreContext, UiStoreContext } from '@store';
import { Cart, CartSuccess } from '@c/Cart';

import TopBar from './Topbar';
import Search from './Search';
import CartMenu from './CartMenu';
import styles from './Header.module.scss';
import { ReactComponent as Logo } from '@assets/logo.svg';

const Header = observer(({ className }) => {
  const { sessionId, cartId, cartNumber } = useContext(SessionStoreContext);
  const { cartCount } = useContext(CartStoreContext);
  const uiContext = useContext(UiStoreContext);

  return (
    <>
      <header className={cns(styles.header, className)}>
        <TopBar />

        <div className={styles.main}>
          <div className="container">
            <div className={styles.wrapper}>
              <div className={styles.colMain}>
                <Link to="/">
                  <Logo />
                </Link>
              </div>
              <div className={styles.colSecond}>
                <Button theme="link">Каталог</Button>
              </div>
              <div className={styles.colThrid}>
                <Search />
                <CartMenu />
              </div>
            </div>
          </div>
        </div>
      </header>

      <Cart />
      <CartSuccess />
    </>
  );
});

export default Header;
