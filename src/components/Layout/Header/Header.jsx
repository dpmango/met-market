import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { SvgIcon, Button } from '@ui';
import { useOnClickOutside } from '@hooks';
import { CatalogStoreContext, UiStoreContext } from '@store';

import { Cart, CartSuccess } from '@c/Cart';
import { CatalogMenu } from '@c/Catalog';
import TopBar from './Topbar';
import Search from './Search';
import CartMenu from './CartMenu';
import styles from './Header.module.scss';
import { ReactComponent as Logo } from '@assets/logo.svg';

const Header = observer(({ className }) => {
  const { categoriesList } = useContext(CatalogStoreContext);
  const { catalogOpened } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);

  const headerRef = useRef(null);

  useOnClickOutside(
    headerRef,
    useCallback((e) => uiContext.setHeaderCatalog(false), [uiContext.setHeaderCatalog])
  );

  return (
    <>
      <header className={cns(styles.header, className)} ref={headerRef}>
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
                <Button
                  className={styles.catalogCta}
                  theme="link"
                  onClick={() => uiContext.setHeaderCatalog(!catalogOpened)}>
                  <div className={cns('hamburger', catalogOpened && 'is-active')}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Каталог</span>
                </Button>
              </div>
              <div className={styles.colThrid}>
                <Search />
                <CartMenu />
              </div>
            </div>
          </div>
        </div>

        <div className={cns(styles.overlay, catalogOpened && styles._active)}>
          <div className={styles.overlayScroller}>
            <div className={styles.overlayContent}>
              <div className="container">
                <CatalogMenu list={categoriesList} />
              </div>
            </div>
          </div>

          <div className={styles.overlayClose} onClick={() => uiContext.setHeaderCatalog(false)}>
            <SvgIcon name="close" />
          </div>
        </div>
      </header>

      <Cart />
      <CartSuccess />
    </>
  );
});

export default Header;
