import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, Checkbox, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext, SessionStoreContext } from '@store';
import { formatPrice } from '@helpers';
import { ruPhoneRegex } from '@helpers/Validation';

import styles from './Cart.module.scss';

const formInitial = {
  phone: '',
  delivery: '',
  comment: '',
};

const Cart = observer(() => {
  const { addToast } = useToasts();

  const { cart, cartCount, cartTotal } = useContext(CartStoreContext);
  const { cartNumber } = useContext(SessionStoreContext);
  const cartContext = useContext(CartStoreContext);
  const sessionContext = useContext(SessionStoreContext);
  const uiContext = useContext(UiStoreContext);

  const [loading, setLoading] = useState(false);
  const [delivery, setDelivery] = useState(false);
  const [comment, setComment] = useState(false);
  const [agree, setAgree] = useState(false);
  const [resetContext, setResetContext] = useState(false);

  const handleCartDelete = useCallback(async (id) => {
    setResetContext(false);

    if (id === 'batch') {
      sessionContext.createSession();
      uiContext.resetModal();
      return;
    }
    setLoading(true);

    await cartContext
      .removeCartItem({ itemId: id })
      .then((_res) => null)
      .catch((_error) => {
        addToast('Ошибка при удалении', { appearance: 'error' });
      });

    setLoading(false);
  }, []);

  const handleCartUpdate = useCallback(async (count, item) => {
    const { itemId, pricePerItem } = item;

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
  }, []);

  const handleValidation = (values) => {
    const errors = {};
    if (!values.phone) {
      errors.phone = 'Введите телефон';
    } else if (!ruPhoneRegex.test(values.phone)) {
      errors.phone = 'Неверный номер телефона';
    }
    return errors;
  };

  const handleSubmit = useCallback(
    async (values, { resetForm }) => {
      setLoading(true);

      console.log(values);

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

  return (
    <Modal name="cart" variant={cartCount ? 'main' : 'narrow'}>
      <div className={styles.cart}>
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
                    <tr key={c.id}>
                      <td>{c.itemFullName}</td>
                      <td>
                        <Input
                          className={styles.numInput}
                          value={c.count}
                          min="1"
                          onChange={(count) => handleCartUpdate(count, c)}
                          type="number"
                        />
                      </td>
                      <td>{formatPrice(c.pricePerItem, 0)}</td>
                      <td>{formatPrice(c.pricePerItem * c.count, 0)}</td>
                      <td>
                        <div className={styles.delete} onClick={() => handleCartDelete(c.itemId)}>
                          <SvgIcon name="delete" />
                        </div>
                      </td>
                    </tr>
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
                  <div className={cns('row')}>
                    <div className="col col-4">
                      {delivery === false ? (
                        <Button theme="primary" outline onClick={() => setDelivery(true)}>
                          + Добавить доставку
                        </Button>
                      ) : (
                        <>
                          <Field type="tel" name="comment">
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
                    <div className="col col-4">
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
                    <div className="col col-4">
                      <Field type="tel" name="phone">
                        {({ field, form: { setFieldValue }, meta }) => (
                          <Input
                            placeholder="Телефон"
                            mask="+7 (999) 999-99-99"
                            value={field.value}
                            error={meta.touched && meta.error}
                            onChange={(v) => {
                              setFieldValue(field.name, v);
                            }}
                          />
                        )}
                      </Field>

                      <Checkbox className={styles.actionBtnCta} isChecked={agree} onChange={() => setAgree(!agree)}>
                        <span>
                          Подтверждаю свое согласие на{' '}
                          <a href="policy.pdf" target="_blank">
                            обработку персональных данных
                          </a>
                        </span>
                      </Checkbox>

                      <Button type="submit" theme="link" className={styles.actionMainBtnCta}>
                        Оформить заказ
                      </Button>
                    </div>
                  </div>
                </Form>
              )}
            </Formik>

            <div className={styles.actions}></div>

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
              onClick={() => uiContext.resetModal()}>
              Каталог
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
});

export default Cart;
