import React, { useContext, useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';
import debounce from 'lodash/debounce';
import { use100vh } from 'react-div-100vh';

import { SvgIcon, Button } from '@ui';
import { useOnClickOutside, useWindowSize } from '@hooks';
import { CatalogStoreContext, UiStoreContext, SessionStoreContext } from '@store';
import { useEventListener, useEmailHook } from '@hooks';
import { fillGapTarget, unfillGapTarget, EVENTLIST, logEvent } from '@helpers';

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
  const [overlayScroll, setOverLayscroll] = useState(0);
  const { width } = useWindowSize();
  const height = use100vh();
  const emailHook = useEmailHook('header-mobile');

  const {
    activeModal,
    catalogOpened,
    header: { scrolled, scrolledSticky },
    query,
  } = useContext(UiStoreContext);
  const { telegramLink, whatsappLink } = useContext(SessionStoreContext);
  const uiContext = useContext(UiStoreContext);

  const headerRef = useRef(null);
  const scrollerRef = useRef(null);

  const handleAbcOrderClick = useCallback(() => {
    setAbcOrder(!abcOrder);
    logEvent({
      name: EVENTLIST.CLICK_ABC_CATEGORIES_SWITCH,
      params: {
        from: width < 768 ? 'mobile' : 'desktop',
      },
    });
  }, [abcOrder, width]);

  const scrollerHeight = useMemo(() => {
    if (width < 768) {
      return height - 52;
    } else {
      return '100%';
    }
  }, [width, height, catalogOpened]);

  const handleScroll = useCallback(
    debounce((e) => {
      // const nearFooter = window.scrollY + window.innerHeight > document.body.scrollHeight - 375;
      const startScrolledAt = width < 768 ? 0 : 45;
      let startStickyAt = width < 768 ? 300 : 460;
      if (document.querySelector('.catalogTable')) {
        startStickyAt = document.querySelector('.catalogTable').offsetTop - (width < 768 ? 32 : 62);
      }

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

  const handleScrollOverlay = useCallback(
    (e) => {
      if (width >= 768) return; // mobile only
      if (!scrollerRef.current) return;

      const { scrollTop } = scrollerRef.current;
      // const nearFooter = window.scrollY + window.innerHeight > document.body.scrollHeight - 375;

      setOverLayscroll(scrollTop >= 60 ? 60 : scrollTop);
    },
    [setOverLayscroll]
  );

  useOnClickOutside(
    headerRef,
    useCallback(
      (e) => {
        if (width >= 768) {
          uiContext.setHeaderCatalog(false);
        }
      },
      [uiContext.setHeaderCatalog, width]
    )
  );

  useEventListener('scroll', handleScroll);
  useEventListener('scroll', handleScrollOverlay, scrollerRef.current);

  useEffect(() => {
    uiContext.setHeaderCatalog(false);
  }, [query.category, query.search]);

  useEffect(() => {
    if (activeModal) {
      uiContext.setHeaderCatalog(false);
    }

    if (width >= 768) {
      const targets = [
        document.body,
        document.querySelector('header'),
        document.querySelector('.breadcrumbs'),
        document.querySelector('.scrolltop'),
      ];

      if (activeModal) {
        uiContext.setHeaderCatalog(false);
        targets.forEach((t) => {
          fillGapTarget(t);
        });

        document.body.classList.add('scroll-locked');
      } else {
        setTimeout(() => {
          targets.forEach((t) => {
            unfillGapTarget(t);
          });

          document.body.classList.remove('scroll-locked');
        }, 300);
      }
    }
  }, [activeModal]);

  useEffect(() => {
    setAbcOrder(false);
    scrollerRef.current.scrollTop = 0;
    setOverLayscroll(0);
  }, [catalogOpened, scrollerRef]);

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
                  onClick={() => {
                    uiContext.resetModal();
                    uiContext.setHeaderCatalog(!catalogOpened);
                    logEvent({ name: EVENTLIST.CLICK_CATALOGBUTTON });
                  }}>
                  <div className={cns('hamburger', catalogOpened && 'is-active')}>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                  <span>Каталог</span>
                </Button>
              </div>
              {width >= 768 && (
                <div className={styles.colThrid}>
                  <Search className={styles.search} />
                  <CartMenu className={styles.cartmenu} />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={cns(styles.overlay, catalogOpened && styles._active, 'overlay')}>
          <div className={cns(styles.overlayScroller, 'overlayScroller')} ref={scrollerRef}>
            <div className={cns(styles.overlayContent, 'overlayContent')}>
              <div className="container">
                <div className={styles.overlaySocials}>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    className={styles.overlaySocialLink}
                    rel="noreferrer"
                    onClick={() => {
                      logEvent({ name: EVENTLIST.CLICK_WHATSAPP, params: { from: 'header' } });
                    }}>
                    <SvgIcon name="social-whatsapp" />
                    <span>Whatsapp</span>
                  </a>
                  <a
                    href={telegramLink}
                    target="_blank"
                    className={styles.overlaySocialLink}
                    rel="noreferrer"
                    onClick={() => {
                      logEvent({ name: EVENTLIST.CLICK_TELEGRAM, params: { from: 'header' } });
                    }}>
                    <SvgIcon name="social-telegram" />
                    <span>Telegram</span>
                  </a>
                  <a
                    href="tel:+74951043130"
                    className={styles.overlaySocialLink}
                    onClick={() => {
                      logEvent({ name: EVENTLIST.CLICK_PHONE, params: { from: 'header' } });
                    }}>
                    <span>8-495-104-31-30</span>
                  </a>
                </div>

                <div className={styles.catLang} onClick={handleAbcOrderClick}>
                  <span>Показать в алфавитном порядке</span>
                  <div className={cns(styles.catLangToggle, abcOrder && styles._active)}></div>
                </div>
                <CatalogMenu type="header" abcOrder={abcOrder} />

                <div className={cns(styles.overlayLinks, 'overlayLinks')}>
                  <a
                    href="/met.market.xlsx"
                    target="_blank"
                    className={cns(styles.priceList)}
                    onClick={() => logEvent({ name: EVENTLIST.CLICK_PRICELIST })}>
                    <SvgIcon name="xls" />
                    <span className="w-700">Прайс-лист</span>
                  </a>
                  <a
                    href="#"
                    data-start="zakaz"
                    data-end="met.market"
                    className={cns(styles.overlaySocialLink, styles.email)}
                    onClick={emailHook.handleEmailClick}
                    onMouseEnter={emailHook.handleEmailHover}
                    ref={emailHook.emailRef}>
                    <SvgIcon name="social-email" key="email" />
                    <span>
                      <img src="/img/mail-white.svg" />
                    </span>
                  </a>

                  <Button
                    theme="link"
                    onClick={(e) => {
                      e.preventDefault();
                      uiContext.setModal('callback');
                      logEvent({ name: EVENTLIST.CLICK_OPENFORM_RFQ, params: { from: 'header' } });
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

      {width < 768 && (
        <div
          className={cns(styles.mobileSearch, catalogOpened && overlayScroll >= 60 && styles.hidden, 'mobileSearch')}
          onClick={(e) => e.stopPropagation()}>
          <div
            className={styles.mobileSearchWrapper}
            style={{ transform: catalogOpened ? `translate3d(0,-${overlayScroll}px,0)` : 'none' }}>
            <Search className={styles.mobileSearchSearch} />
          </div>
        </div>
      )}

      <Cart />
      <CartSuccess />

      <Callback />
      <CallbackSuccess />

      <ScrollTop visible={scrolledSticky} />
    </>
  );
});

export default Header;
