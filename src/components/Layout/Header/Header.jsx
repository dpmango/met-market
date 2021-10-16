import React, { useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';
import debounce from 'lodash/debounce';
import { use100vh } from 'react-div-100vh';

import { SvgIcon, Button } from '@ui';
import { useOnClickOutside, useWindowSize } from '@hooks';
import { CatalogStoreContext, UiStoreContext } from '@store';
import { useEventListener } from '@hooks';
import { ScrollTo } from '@helpers';

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
  const { width } = useWindowSize();
  const height = use100vh();

  const {
    activeModal,
    catalogOpened,
    header: { scrolled, scrolledSticky },
    query,
  } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);

  const headerRef = useRef(null);

  const scrollerHeight = useMemo(() => {
    if (width < 768) {
      return height - 52;
    } else {
      return '100%';
    }
  }, [width, height]);

  const handleScroll = useCallback(
    debounce((e) => {
      // const nearFooter = window.scrollY + window.innerHeight > document.body.scrollHeight - 375;
      const startScrolledAt = width < 768 ? 0 : 45;
      const startStickyAt = width < 768 ? 45 : 460;
      const stickyHeader = window.scrollY > startStickyAt;

      if (window.scrollY > startScrolledAt) {
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
    [scrolled, uiContext.uiContext, width]
  );

  useOnClickOutside(
    headerRef,
    useCallback((e) => uiContext.setHeaderCatalog(false), [uiContext.setHeaderCatalog])
  );

  useEventListener('scroll', handleScroll);

  useEffect(() => {
    uiContext.setHeaderCatalog(false);
  }, [query.category, query.search]);

  useEffect(() => {
    if (activeModal) {
      uiContext.setHeaderCatalog(false);
    }
  }, [activeModal]);

  return (
    <>
      <header
        className={cns(
          styles.header,
          scrolled && styles._scrolled,
          catalogOpened && styles._catalogOpened,
          scrolledSticky && styles._sticky,
          className
        )}
        ref={headerRef}>
        <TopBar />

        <div className={styles.main}>
          <div className="container">
            <div className={styles.wrapper}>
              <div className={styles.colMobile}>
                <CartMenu showLabel={false} />
              </div>
              <div className={styles.colMain}>
                <Link to="/" onClick={() => uiContext.updateParams(null)} className={styles.logo}>
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
          <div className={styles.overlayScroller} style={{ height: scrollerHeight }}>
            <div className={styles.overlayContent}>
              <div className="container">
                <div className={styles.overlaySearch}>
                  <Search className={styles.search} />
                </div>
                <div className={styles.overlaySocials}>
                  <a href="https://whatsupp.com" target="_blank" className={styles.overlaySocialLink} rel="noreferrer">
                    <SvgIcon name="social-whatsapp" />
                    <span>Whatsapp</span>
                  </a>
                  <a href="https://t.me/" target="_blank" className={styles.overlaySocialLink} rel="noreferrer">
                    <SvgIcon name="social-telegram" />
                    <span>Telegram</span>
                  </a>
                  <a href="tel:88003508625" className={styles.overlaySocialLink}>
                    <span>8-800-350-86-25</span>
                  </a>
                </div>

                <div className={styles.catLang} onClick={() => setAbcOrder(!abcOrder)}>
                  <span>Показать в алфавитном порядке</span>
                  <div className={cns(styles.catLangToggle, abcOrder && styles._active)}></div>
                </div>
                <CatalogMenu abcOrder={abcOrder} />

                <div className={styles.overlayLinks}>
                  <a href="/catalog.pdf" target="_blank" className={cns(styles.priceList)}>
                    <SvgIcon name="pdf" />
                    <span className="w-700">Прайс-лист</span>
                  </a>

                  <Button
                    theme="link"
                    onClick={(e) => {
                      e.preventDefault();
                      uiContext.setModal('callback');
                    }}>
                    Отправить заявку
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className={styles.overlayClose} onClick={() => uiContext.setHeaderCatalog(false)}>
            <SvgIcon name="close" />
          </div>
        </div>
      </header>

      <div className={styles.mobileSearch}>
        <Search className={styles.mobileSearchSearch} />
      </div>

      <Cart />
      <CartSuccess />

      <Callback />
      <CallbackSuccess />

      <ScrollTop visible={scrolledSticky} />
    </>
  );
});

export default Header;
