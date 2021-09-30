import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext } from '@store';
import { useQuery } from '@hooks';
import { formatPrice } from '@helpers';

import styles from './Cart.module.scss';

const Cart = observer(() => {
  const history = useHistory();
  const query = useQuery();
  const { cart, cartCount } = useContext(CartStoreContext);
  const cartContext = useContext(CartStoreContext);

  return (
    <Modal name="cart" variant={cartCount ? 'main' : 'narrow'}>
      <div className={styles.cart}>
        {cartCount ? (
          <>
            <div className="dev-log">{JSON.stringify(cart, null, 2)}</div>
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
