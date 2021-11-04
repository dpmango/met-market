import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';
import { Scrollbar, FreeMode, Mousewheel } from 'swiper';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, NumInput, SvgIcon } from '@ui';
import { UiStoreContext, CatalogStoreContext, CartStoreContext } from '@store';
import { useFirstRender, useWindowSize } from '@hooks';
import { priceWithTonnage, formatPrice, isMobile } from '@helpers';
import { browser } from '@src/index';

import styles from './AddToCart.module.scss';
import 'swiper/swiper.scss';
import 'swiper/modules/scrollbar/scrollbar.scss';
import 'swiper/modules/free-mode/free-mode.scss';
import 'swiper/modules/mousewheel/mousewheel.scss';

const AddToCart = observer(() => {
  const { addToast } = useToasts();
  const firstRender = useFirstRender();
  const countRef = useRef(null);
  const { width } = useWindowSize();

  const { activeModal, prevModal, modalParams, query } = useContext(UiStoreContext);
  const { getCategoryByName } = useContext(CatalogStoreContext);
  const cartContext = useContext(CartStoreContext);
  const uiContext = useContext(UiStoreContext);

  const [modalData, setModalData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cartUpdated, setСartUpdated] = useState(true);
  const [count, setCount] = useState(1);

  const cartItem = useMemo(() => {
    if (modalData && modalData.idUnique) {
      return cartContext.getItemInCart(modalData.idUnique);
    }

    return null;
  }, [cartContext.cart, modalData]);

  // actions
  const handleCartSubmit = useCallback(
    async (event) => {
      event && event.preventDefault();
      if (loading) return;

      setLoading(true);

      const { idUnique, price, nameFull } = modalParams;

      if (!cartItem) {
        await cartContext
          .addCartItem({ itemId: idUnique, count, pricePerItem: price, itemFullName: nameFull })
          .then((_res) => {
            uiContext.resetModal();
          })
          .catch((_error) => {
            // dispatch({ key: 'error', value: _error });
          });
      } else {
        if (cartUpdated) {
          setLoading(false);
          return;
        }

        setСartUpdated(false);
        await cartContext
          .updateCartItem({ itemId: idUnique, count, pricePerItem: price })
          .then((_res) => {
            setСartUpdated(true);
          })
          .catch((_error) => {
            addToast('сбой подключения, проверьте наличие интернета и попробуйте еще раз', { appearance: 'error' });
          });
      }

      setLoading(false);
    },
    [loading, cartUpdated, modalParams, count, cartItem]
  );

  const handleCartDelete = useCallback(async () => {
    const { idUnique } = modalParams;
    setLoading(true);

    await cartContext
      .removeCartItem({ itemId: idUnique })
      .then((_res) => {
        // history.push(routes.HOME);
      })
      .catch((_error) => {
        addToast('сбой подключения, проверьте наличие интернета и попробуйте еще раз', { appearance: 'error' });
      });

    setLoading(false);
  }, [modalParams]);

  // effects
  useEffect(() => {
    if (activeModal === null) {
      setCount(1);
    } else {
      if (cartItem) {
        setCount(cartItem.count);
      }
    }
  }, [activeModal]);

  useEffect(() => {
    if (cartItem) {
      setСartUpdated(cartItem.count === count);
    } else {
      setСartUpdated(false);
    }
  }, [count, cartItem]);

  useEffect(() => {
    if (cartItem) {
      setCount(cartItem.count);
    }
  }, [cartItem]);

  useEffect(() => {
    if (modalParams && activeModal === 'cart-add') {
      setModalData(modalParams);
    } else if (prevModal === 'cart-add') {
      if (!firstRender) {
        setTimeout(() => {
          setModalData(null);
        }, 300);
      }
    }
  }, [modalParams, activeModal]);

  // memos
  const itemCategory = useMemo(() => {
    if (!modalData) return;
    const { cat1, cat2, cat3 } = modalData;
    const name = cat3 || cat2 || cat1 || null;

    if (name) {
      const category = getCategoryByName(name);

      return category;
    }

    return null;
  }, [modalData]);

  const singlePriceWithTonnage = useMemo(() => {
    if (!modalData) {
      return 0;
    }
    if (count < 1) {
      return priceWithTonnage(modalData.price, true);
    } else {
      return modalData.price;
    }
  }, [modalData, count]);

  const totalPriceWithTonnage = useMemo(() => {
    if (!modalData) {
      return 0;
    }

    return priceWithTonnage(modalData.price, count);
  }, [modalData, count]);

  useEffect(() => {
    if (query.product && modalData && !isMobile()) {
      countRef && countRef.current && countRef.current.focus();
    }
  }, [query, modalData]);

  return (
    <Modal name="cart-add">
      <div className={cns(styles.cart, loading && styles._loading)}>
        {modalData ? (
          <>
            <div className={styles.head}>
              <div className={styles.headTitle}>{modalData.nameFull}</div>
            </div>
            <Swiper
              modules={[FreeMode, Scrollbar, Mousewheel]}
              freeMode={{ sticky: false }}
              scrollbar={{ draggable: true, dragSize: 40, snapOnRelease: false }}
              mousewheel={{ invert: false }}
              slidesPerView={'auto'}>
              <SwiperSlide className={styles.body}>
                <div className={styles.bodyImage}>
                  {itemCategory && (
                    <img src={itemCategory.image || 'img/search-placeholder.jpg'} alt={itemCategory.name} />
                  )}
                </div>
                <div className={styles.bodyTable}>
                  <>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Тип товара</span>
                      <span className={styles.rowContent}>{itemCategory ? itemCategory.name : <Spinner />}</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Код товара</span>
                      <span className={styles.rowContent}>{modalData.idUnique}</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Размер</span>
                      <span className={styles.rowContent}>{modalData.size[0]}</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Марка</span>
                      <span className={styles.rowContent}>{modalData.mark[0]}</span>
                    </div>
                    <div className={styles.row}>
                      <span className={styles.rowLabel}>Длина</span>
                      <span className={styles.rowContent}>{modalData.length[0]}</span>
                    </div>
                  </>
                </div>
              </SwiperSlide>
            </Swiper>
            {cartItem && modalData && (
              <div className={styles.incart}>
                <div className={styles.incartIcon}>
                  <SvgIcon name="cart-mini" />
                </div>
                <div className={styles.incartTitle}>
                  В корзине {cartItem.count} {modalData.priceQuantityUnit} на сумму{' '}
                  {formatPrice(cartItem.pricePerItem * cartItem.count, 0)} ₽/
                  {modalData.priceQuantityUnit}
                </div>
                <div className={styles.incartDelete} onClick={handleCartDelete}>
                  <SvgIcon name="delete" />
                </div>
              </div>
            )}

            {!modalData && (
              <div className={styles.incart}>
                <Spinner />
              </div>
            )}

            {modalData ? (
              <form className={styles.actions} onSubmit={handleCartSubmit}>
                <div className={styles.actionsWrapper}>
                  <div className={styles.actionCol}>
                    <NumInput
                      className={styles.numInput}
                      variant="small"
                      label={`Количество, ${modalData.priceQuantityUnit}`}
                      value={count}
                      onChange={(v) => setCount(v)}
                      onEnterKey={() => width >= 768 && handleCartSubmit()}
                      inputRef={countRef}
                    />
                  </div>

                  <div className={styles.actionCol}>
                    <Input
                      variant="small"
                      label="Цена с НДС"
                      placeholder=""
                      className={styles.clearInputMobile}
                      value={`${formatPrice(singlePriceWithTonnage, 0)} ₽/${modalData.priceQuantityUnit}`}
                      disabled
                    />
                  </div>
                  <div className={styles.actionCol}>
                    <Input
                      variant="small"
                      label="Сумма"
                      placeholder=""
                      className={styles.clearInputMobile}
                      value={`${formatPrice(totalPriceWithTonnage, 0)} ₽`}
                      disabled
                    />
                  </div>
                  <div className={cns(styles.actionCol, styles.wide)}>
                    {!cartItem ? (
                      <Button theme="link" type="submit" loading={loading}>
                        Добавить в корзину
                      </Button>
                    ) : (
                      <Button theme="link" type="submit" disabled={cartUpdated} loading={loading}>
                        {cartUpdated ? 'Корзина обновлена' : 'Обновить в корзине'}
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            ) : (
              <Spinner />
            )}
          </>
        ) : (
          <Spinner />
        )}
      </div>

      {/* <div className="dev-log">{JSON.stringify(cartContext.cart, null, 2)}</div> */}
    </Modal>
  );
});

export default AddToCart;
