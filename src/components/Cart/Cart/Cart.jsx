import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';
import { useFormik } from 'formik';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { Modal, Spinner, Button, Input, Checkbox, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext, SessionStoreContext, CallbackStoreContext } from '@store';
import { getEnv, formatPrice, updateQueryParams, EVENTLIST, logEvent } from '@helpers';
import { useFirstRender } from '@hooks';
import { ruPhoneRegex, phoneMaskCleared } from '@helpers/Validation';

import CartProduct from './CartProduct';
import ResetCart from './ResetCart';
import styles from './Cart.module.scss';

const Cart = observer(() => {
  const { addToast } = useToasts();
  const history = useHistory();
  const location = useLocation();
  const firstRender = useFirstRender();

  const { cart, cartCount, cartTotal } = useContext(CartStoreContext);
  const { cartNumber } = useContext(SessionStoreContext);
  const { activeModal, prevModal, modalParams, query } = useContext(UiStoreContext);
  const cartContext = useContext(CartStoreContext);
  const sessionContext = useContext(SessionStoreContext);
  const callbackContext = useContext(CallbackStoreContext);
  const uiContext = useContext(UiStoreContext);

  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [comment, setComment] = useState(false);
  const [agree, setAgree] = useState(false);
  const [resetContext, setResetContext] = useState(false);

  const handleCartDelete = useCallback(
    async (id) => {
      setResetContext(false);

      if (id === 'batch') {
        sessionContext.createSession();
        uiContext.resetModal();
        return;
      }

      if (loading) return;

      setLoading(true);

      await cartContext
        .removeCartItem({ itemId: id })
        .then((_res) => null)
        .catch((_error) => {
          addToast('Ошибка при удалении', { appearance: 'error' });
        });

      setLoading(false);
    },
    [loading]
  );

  const handleCartUpdate = useCallback(
    async (count, item) => {
      const { itemId, pricePerItem } = item;

      if (loading) return;
      setLoading(true);

      await cartContext
        .updateCartItem({ itemId, count, pricePerItem })
        .then((_res) => {
          // addToast('Корзина обновлена', { appearance: 'success' });
        })
        .catch((_error) => {
          addToast('Ошибка при обновлении', { appearance: 'error' });
        });

      setLoading(false);
    },
    [loading]
  );

  const handleValidation = useCallback((values) => {
    const errors = {};
    if (!values.phone) {
      errors.phone = 'Введите телефон';
    } else if (!ruPhoneRegex.test(phoneMaskCleared(values.phone))) {
      errors.phone = 'Неверный номер телефона';
    } else if (!values.agree) {
      errors.agree = 'Необходимо согласие';
    }
    return errors;
  }, []);

  const handleSubmit = useCallback(
    async (values, { resetForm }) => {
      setLoading(true);

      await cartContext
        .submitCart({
          phone: values.phone,
          deliveryInfo: values.delivery,
          comment: values.comment,
          totalPrice: cartTotal,
        })
        .then((orderNumber) => {
          uiContext.setModal('cartsuccess', { orderNumber });
          logEvent({ name: EVENTLIST.MAKE_ORDER });
        })
        .catch((_error) => {
          addToast('Ошибка при отправке', { appearance: 'error' });
        });

      setLoading(false);
    },
    [cartTotal]
  );

  const preventSubmitOnEnter = useCallback((e) => {
    if (e.keyCode === 13) {
      e.target.blur();
      return;
    }
  }, []);

  const submitTypingDelivery = useCallback(
    debounce((val) => {
      if (val) {
        callbackContext.typingForm({
          type: 'Cart',
          payload: { id: 'delivery', content: `${val}` },
        });
      }
    }, getEnv('TYPING_SPEED')),
    []
  );

  const submitTypingComment = useCallback(
    debounce((val) => {
      if (val) {
        callbackContext.typingForm({
          type: 'Cart',
          payload: { id: 'comment', content: `${val}` },
        });
      }
    }, getEnv('TYPING_SPEED')),
    []
  );
  const submitTypingPhone = useCallback(
    debounce((val) => {
      if (val) {
        callbackContext.typingForm({
          type: 'Cart',
          payload: { id: 'phone', content: `${val}` },
        });
      }
    }, getEnv('TYPING_SPEED')),
    []
  );
  const submitTypingAgree = useCallback(
    debounce((val) => {
      if (val) {
        callbackContext.typingForm({
          type: 'Cart',
          payload: { id: 'agree', content: `${val}` },
        });
      }
    }, getEnv('TYPING_SPEED')),
    []
  );

  useEffect(() => {
    if (prevModal !== 'cart' && activeModal === 'cart') {
      updateQueryParams({
        location,
        history,
        payload: {
          type: 'cart',
          value: true,
        },
      });
    } else if (prevModal === 'cart' && activeModal === null) {
      updateQueryParams({
        location,
        history,
        payload: {
          type: 'cart',
          value: false,
        },
      });
    }
  }, [activeModal]);

  useEffect(() => {
    if (query.cart) {
      uiContext.setModal('cart');
    } else {
      if (!firstRender) {
        uiContext.resetModal();
      }
    }
  }, [query.cart]);

  const formik = useFormik({
    initialValues: {
      phone: '',
      delivery: '',
      comment: '',
      agree: false,
    },
    validateOnChange: false,
    validate: handleValidation,
    onSubmit: handleSubmit,
  });

  return (
    <Modal name="cart" mobTitle={`Корзина &nbsp;<span>#${cartNumber}</span>`} variant={cartCount ? 'main' : 'narrow'}>
      <div className={cns(styles.cart, loading && styles._loading)}>
        {cartCount ? (
          <>
            <div className={styles.head}>
              <div className={styles.headTitle}>
                Ваша корзина &nbsp;<span>#{cartNumber}</span>
              </div>
            </div>

            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Название</th>
                  <th></th>
                  <th>Количество</th>
                  <th>Цена с НДС</th>
                  <th>Сумма</th>
                  <th>
                    <div className={cns(styles.delete, styles._circle)} onClick={() => setResetContext(true)}>
                      <SvgIcon name="delete" />

                      <ResetCart
                        active={resetContext}
                        handleCartDelete={handleCartDelete}
                        setResetContext={setResetContext}
                      />
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {cart &&
                  cart.length > 0 &&
                  cart.map((c) => (
                    <CartProduct
                      product={c}
                      key={c.id}
                      handleCartDelete={handleCartDelete}
                      handleCartUpdate={handleCartUpdate}
                    />
                  ))}
              </tbody>
            </table>

            <div className={styles.count}>
              <div className={styles.countMain}>ИТОГО: {formatPrice(cartTotal, 0)} ₽</div>
              <div className={styles.countVAT}>В том числе НДС: {formatPrice((cartTotal / 120) * 20, 0)} ₽</div>
            </div>

            <form onSubmit={formik.handleSubmit} className={styles.actions}>
              <div className="row">
                <div className="col col-4 col-md-12">
                  {delivery === false ? (
                    <Button theme="primary" outline onClick={() => setDelivery(true)}>
                      + Добавить доставку
                    </Button>
                  ) : (
                    <>
                      <Input
                        type="textarea"
                        rows="5"
                        placeholder="Город, населенный пункт, улица, дом"
                        value={formik.values.delivery}
                        error={formik.touched.delivery && formik.errors.delivery}
                        onChange={(v) => {
                          formik.setFieldValue('delivery', v);
                          submitTypingDelivery(v);
                          formik.setFieldError('delivery');
                        }}
                        onKeyDown={preventSubmitOnEnter}
                      />

                      <Button theme="primary" className={styles.actionBtnCta} onClick={() => setDelivery(false)}>
                        - Удалить доставку
                      </Button>
                    </>
                  )}
                </div>
                <div className="col col-4 col-md-12">
                  {comment === false ? (
                    <Button theme="primary" outline onClick={() => setComment(true)}>
                      + Комментарий
                    </Button>
                  ) : (
                    <>
                      <Input
                        type="textarea"
                        rows="5"
                        placeholder="Введите комментарий к заказу"
                        value={formik.values.comment}
                        error={formik.touched.comment && formik.errors.comment}
                        onChange={(v) => {
                          formik.setFieldValue('comment', v);
                          submitTypingComment(v);
                          formik.setFieldError('comment');
                        }}
                        onKeyDown={preventSubmitOnEnter}
                      />

                      <Button theme="primary" className={styles.actionBtnCta} onClick={() => setComment(false)}>
                        - Удалить комментарий
                      </Button>
                    </>
                  )}
                </div>
                <div className="col col-md-12 md-visible">
                  <Button theme="primary" outline onClick={() => setResetContext(true)}>
                    Очистить
                  </Button>
                </div>

                <div className="col col-4 col-md-12">
                  <Input
                    type="tel"
                    placeholder="Телефон"
                    mask="+7 (999) 999-99-99"
                    value={formik.values.phone}
                    error={formik.touched.phone && formik.errors.phone}
                    showError={false}
                    onChange={(v) => {
                      formik.setFieldValue('phone', v);
                      submitTypingPhone(v);
                      formik.setFieldError('phone');
                    }}
                    onKeyDown={preventSubmitOnEnter}
                  />

                  <Checkbox
                    className={styles.actionBtnCta}
                    isChecked={formik.values.agree}
                    error={formik.touched.agree && formik.errors.agree}
                    onChange={() => {
                      formik.setFieldValue('agree', !formik.values.agree);
                      submitTypingAgree(!formik.values.agree);
                      formik.setFieldError('agree');
                    }}>
                    <span>
                      Подтверждаю свое согласие на{' '}
                      <a href="/policy.pdf" target="_blank">
                        обработку персональных данных
                      </a>
                    </span>
                  </Checkbox>

                  <Button loading={loading} type="submit" theme="link" className={styles.actionMainBtnCta}>
                    Оформить заказ
                  </Button>
                </div>
              </div>

              <ResetCart
                className={styles.mobileReset}
                active={resetContext}
                handleCartDelete={handleCartDelete}
                setResetContext={setResetContext}
              />
            </form>
            {/* <div className="dev-log">{JSON.stringify(cart, null, 2)}</div> */}
          </>
        ) : (
          <div className={styles.empty}>
            <div className={styles.emptyIcon}>
              <SvgIcon name="cart-full" />
            </div>

            <div className={styles.emptySeparator}></div>
            <div className={styles.emptyTitle}>Ваша корзина пуста</div>
            <p className={styles.emptyText}>Выберите нужный товар из каталога и добавьте его в корзину.</p>

            <Button
              className={styles.emptyCta}
              theme="accent"
              iconRight="arrow-long"
              loading={loading}
              onClick={() => {
                uiContext.resetModal();
                updateQueryParams({
                  location,
                  history,
                  payload: {
                    type: 'category',
                    value: 'all',
                  },
                });
              }}>
              Каталог
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
});

export default memo(Cart);
