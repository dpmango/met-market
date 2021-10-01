import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, Checkbox, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext, SessionStoreContext } from '@store';
import { useQuery } from '@hooks';
import { formatPrice } from '@helpers';

import styles from './Cart.module.scss';

const Cart = observer(() => {
  const { addToast } = useToasts();

  const history = useHistory();
  const query = useQuery();

  const { cart, cartCount, cartTotal } = useContext(CartStoreContext);
  const { cartNumber } = useContext(SessionStoreContext);
  const cartContext = useContext(CartStoreContext);
  const uiContext = useContext(UiStoreContext);

  const [phone, setPhone] = useState('');
  const [delivery, setDelivery] = useState(false);
  const [comment, setComment] = useState(false);
  const [agree, setAgree] = useState(false);
  const [resetContext, setResetContext] = useState(false);

  const handleCartDelete = useCallback((id) => {
    if (id === 'batch') {
      setResetContext(false);
      return;
    }

    cartContext
      .removeCartItem({ itemId: id })
      .then((_res) => {
        // history.push(routes.HOME);
      })
      .catch((_error) => {
        // dispatch({ key: 'error', value: _error });
      });
  }, []);

  const handleCartUpdate = useCallback((count, item) => {
    const { itemId, pricePerItem } = item;

    cartContext
      .updateCartItem({ itemId, count, pricePerItem })
      .then((_res) => {
        addToast('Корзина обновлена', { appearance: 'success' });
      })
      .catch((_error) => {
        addToast('Ошибка при обновлении', { appearance: 'error' });
      });
  }, []);

  const handleCartSubmit = useCallback(() => {
    cartContext
      .submitCart({ phone, deliveryInfo: delivery, comment, totalPrice: cartTotal })
      .then((_res) => {
        // history.push(routes.HOME);
      })
      .catch((_error) => {
        // dispatch({ key: 'error', value: _error });
      });
  }, [phone, agree, delivery, comment, cartTotal]);

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
              <div className={styles.countVAT}>В том числе НДС: {formatPrice(cartTotal * 0.2, 0)} ₽</div>
            </div>

            <div className={styles.actions}>
              <div className={cns('row')}>
                <div className="col col-4">
                  {delivery === false ? (
                    <Button theme="primary" outline onClick={() => setDelivery('')}>
                      + Добавить доставку
                    </Button>
                  ) : (
                    <>
                      <Input
                        type="textarea"
                        rows="5"
                        placeholder="Город, населенный пункт, улица, дом"
                        value={delivery}
                        onChange={(v) => setDelivery(v)}></Input>

                      <Button theme="primary" className={styles.actionBtnCta} onClick={() => setDelivery(false)}>
                        - Удалить доставку
                      </Button>
                    </>
                  )}
                </div>
                <div className="col col-4">
                  {comment === false ? (
                    <Button theme="primary" outline onClick={() => setComment('')}>
                      + Комментарий
                    </Button>
                  ) : (
                    <>
                      <Input
                        type="textarea"
                        rows="5"
                        placeholder="Введите комментарий к заказу"
                        value={comment}
                        onChange={(v) => setComment(v)}></Input>

                      <Button theme="primary" className={styles.actionBtnCta} onClick={() => setComment(false)}>
                        - Удалить комментарий
                      </Button>
                    </>
                  )}
                </div>
                <div className="col col-4">
                  <Input placeholder="Телефон" value={phone} onChange={(v) => setPhone(v)}></Input>
                  <Checkbox className={styles.actionBtnCta} isChecked={agree} onChange={() => setAgree(!agree)}>
                    <span>
                      Подтверждаю свое согласие на{' '}
                      <a href="policy.pdf" target="_blank">
                        обработку персональных данных
                      </a>
                    </span>
                  </Checkbox>
                  <Button theme="link" className={styles.actionMainBtnCta} onClick={handleCartSubmit}>
                    Оформить заказ
                  </Button>
                </div>
              </div>
            </div>

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
