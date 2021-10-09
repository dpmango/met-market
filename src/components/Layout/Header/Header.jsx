import React, { useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { SvgIcon, Button } from '@ui';
import { useOnClickOutside } from '@hooks';
import { CatalogStoreContext, UiStoreContext } from '@store';
import { useEventListener } from '@hooks';

import { Cart, CartSuccess } from '@c/Cart';
import { Callback, CallbackSuccess } from '@c/Callback';
import { CatalogMenu } from '@c/Catalog';
import TopBar from './Topbar';
import Search from './Search';
import CartMenu from './CartMenu';
import ScrollTop from './ScrollTop';
import styles from './Header.module.scss';
import { ReactComponent as Logo } from '@assets/logo.svg';
import { ReactComponent as LogoTablet } from '@assets/logo-tablet.svg';

const Header = observer(({ className }) => {
  const [abcOrder, setAbcOrder] = useState(false);

  const {
    catalogOpened,
    header: { scrolled, scrolledSticky },
  } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);

  const headerRef = useRef(null);

  const handleScroll = useCallback(
    debounce((e) => {
      // const nearFooter = window.scrollY + window.innerHeight > document.body.scrollHeight - 375;
      const stickyHeader = window.scrollY > 460;

      if (window.scrollY > 45) {
        if (!scrolled) {
          uiContext.setScrolled(true);
          document.body.classList.add('scrolled');
        }
      } else {
        if (scrolled) {
          uiContext.setScrolled(false);
          document.body.classList.remove('scrolled');
        }
      }

      uiContext.setScrolledSticky(stickyHeader);
    }, 10),
    [scrolled, uiContext.uiContext]
  );

  useOnClickOutside(
    headerRef,
    useCallback((e) => uiContext.setHeaderCatalog(false), [uiContext.setHeaderCatalog])
  );

  useEventListener('scroll', handleScroll);

  return (
    <>
      <header className={cns(styles.header, scrolled && styles._scrolled, className)} ref={headerRef}>
        <TopBar />

        <div className={styles.main}>
          <div className="container">
            <div className={styles.wrapper}>
              <div className={styles.colMobile}>
                <CartMenu showLabel={false} />
              </div>
              <div className={styles.colMain}>
                <Link to="/" className={styles.logo}>
                  <Logo className={styles.logoDesktop} />
                  <LogoTablet className={styles.logoTablet} />
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
                <Search className={styles.search} />
                <CartMenu className={styles.cartmenu} />
              </div>
            </div>
          </div>
        </div>

        <div className={cns(styles.overlay, catalogOpened && styles._active)}>
          <div className={styles.overlayScroller}>
            <div className={styles.overlayContent}>
              <div className="container">
                <div className={styles.catLang} onClick={() => setAbcOrder(!abcOrder)}>
                  <span>Показать в алфавитном порядке</span>
                  <div className={cns(styles.catLangToggle, abcOrder && styles._active)}></div>
                </div>
                <CatalogMenu abcOrder={abcOrder} />
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

      <Callback />
      <CallbackSuccess />

      <ScrollTop visible={scrolledSticky} />
    </>
  );
});

export default Header;
