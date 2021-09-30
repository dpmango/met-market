import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext, SessionStoreContext } from '@store';
import { useQuery } from '@hooks';
import { formatPrice } from '@helpers';

import styles from './Cart.module.scss';

const Cart = observer(() => {
  const history = useHistory();
  const query = useQuery();
  const { cart, cartCount, cartTotal } = useContext(CartStoreContext);
  const { cartNumber } = useContext(SessionStoreContext);
  const cartContext = useContext(CartStoreContext);

  const handleCartDelete = useCallback((id) => {
    cartContext
      .removeCartItem({ itemId: id })
      .then((_res) => {
        // history.push(routes.HOME);
      })
      .catch((_error) => {
        // dispatch({ key: 'error', value: _error });
      });
  }, []);

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
                    <SvgIcon name="delete" />
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
                        <Input className={styles.numInput} value={c.count} type="number" />
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

            {/* <div className="dev-log">{JSON.stringify(cart, null, 2)}</div> */}
          </>
        ) : (
          <div className={styles.empty}>
            <h1>Ваша корзина пуста</h1>
            <p>Выберите нужный товар из каталога и добавьте его в корзину.</p>
          </div>
        )}
      </div>
    </Modal>
  );
});

export default Cart;
