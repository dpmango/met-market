import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, Checkbox, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext, SessionStoreContext } from '@store';
import { formatPrice, updateQueryParams } from '@helpers';
import { useQuery } from '@hooks';
import { ruPhoneRegex } from '@helpers/Validation';

import CartProduct from './CartProduct';
import styles from './Cart.module.scss';

const formInitial = {
  phone: '',
  delivery: '',
  comment: '',
  agree: false,
};

const Cart = observer(() => {
  const { addToast } = useToasts();
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();

  const { cart, cartCount, cartTotal } = useContext(CartStoreContext);
  const { cartNumber } = useContext(SessionStoreContext);
  const { activeModal, prevModal, modalParams } = useContext(UiStoreContext);
  const cartContext = useContext(CartStoreContext);
  const sessionContext = useContext(SessionStoreContext);
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

  const handleValidation = (values) => {
    const errors = {};
    if (!values.phone) {
      errors.phone = 'Введите телефон';
    } else if (!ruPhoneRegex.test(values.phone)) {
      errors.phone = 'Неверный номер телефона';
    } else if (!values.agree) {
      errors.agree = 'Необходимо согласие';
    }
    return errors;
  };

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
        })
        .catch((_error) => {
          addToast('Ошибка при отправке', { appearance: 'error' });
        });

      setLoading(false);
    },
    [cartTotal]
  );

  useEffect(() => {
    if (prevModal !== 'cart' && activeModal === 'cart') {
      updateQueryParams({
        location,
        history,
        query,
        payload: {
          type: 'cart',
          value: true,
        },
      });
    } else if (prevModal === 'cart' && activeModal === null) {
      updateQueryParams({
        location,
        history,
        query,
        payload: {
          type: 'cart',
          value: false,
        },
      });
    }
  }, [activeModal, prevModal]);

  useEffect(() => {
    if (query.get('cart')) {
      uiContext.setModal('cart');
    } else {
      uiContext.resetModal();
    }
  }, [query.get('cart')]);

  return (
    <Modal name="cart" variant={cartCount ? 'main' : 'narrow'}>
      <div className={cns(styles.cart, loading && styles._loading)}>
        {cartCount && !loading ? (
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
                  <th>Количество</th>
                  <th>Цена с НДС</th>
                  <th>Сумма</th>
                  <th>
                    <div className={cns(styles.delete, styles._circle)} onClick={() => setResetContext(true)}>
                      <SvgIcon name="delete" />

                      <div
                        className={cns(styles.reset, resetContext && styles._active)}
                        onClick={(e) => e.stopPropagation()}>
                        <div className={styles.resetTitle}>Очистить корзину?</div>
                        <div className={styles.resetCta}>
                          <Button theme="gray" onClick={() => handleCartDelete('batch')}>
                            Да
                          </Button>
                          <Button theme="danger" onClick={() => setResetContext(false)}>
                            Отмена
                          </Button>
                        </div>
                      </div>
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

            <Formik initialValues={formInitial} validate={handleValidation} onSubmit={handleSubmit}>
              {({ isSubmitting, values }) => (
                <Form className={styles.actions}>
                  <div className="row">
                    <div className="col col-4 col-md-12">
                      {delivery === false ? (
                        <Button theme="primary" outline onClick={() => setDelivery(true)}>
                          + Добавить доставку
                        </Button>
                      ) : (
                        <>
                          <Field type="tel" name="delivery">
                            {({ field, form: { setFieldValue }, meta }) => (
                              <Input
                                type="textarea"
                                rows="5"
                                placeholder="Город, населенный пункт, улица, дом"
                                value={field.value}
                                error={meta.touched && meta.error}
                                onChange={(v) => {
                                  setFieldValue(field.name, v);
                                }}
                              />
                            )}
                          </Field>

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
                          <Field type="tel" name="comment">
                            {({ field, form: { setFieldValue }, meta }) => (
                              <Input
                                type="textarea"
                                rows="5"
                                placeholder="Введите комментарий к заказу"
                                value={field.value}
                                error={meta.touched && meta.error}
                                onChange={(v) => {
                                  setFieldValue(field.name, v);
                                }}
                              />
                            )}
                          </Field>

                          <Button theme="primary" className={styles.actionBtnCta} onClick={() => setComment(false)}>
                            - Удалить комментарий
                          </Button>
                        </>
                      )}
                    </div>
                    <div className="col col-4 col-md-12">
                      <Field type="tel" name="phone">
                        {({ field, form: { setFieldValue }, meta }) => (
                          <Input
                            placeholder="Телефон"
                            mask="+7 (999) 999-99-99"
                            value={field.value}
                            error={meta.touched && meta.error}
                            showError={false}
                            onChange={(v) => {
                              setFieldValue(field.name, v);
                            }}
                          />
                        )}
                      </Field>

                      <Field type="checkbox" name="agree">
                        {({ field, form: { setFieldValue }, meta }) => (
                          <Checkbox
                            className={styles.actionBtnCta}
                            isChecked={field.value}
                            error={meta.touched && meta.error}
                            onChange={() => {
                              setFieldValue(field.name, !field.value);
                            }}>
                            <span>
                              Подтверждаю свое согласие на{' '}
                              <a href="policy.pdf" target="_blank">
                                обработку персональных данных
                              </a>
                            </span>
                          </Checkbox>
                        )}
                      </Field>

                      <Button type="submit" theme="link" className={styles.actionMainBtnCta}>
                        Оформить заказ
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>

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
                  query,
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

export default Cart;
