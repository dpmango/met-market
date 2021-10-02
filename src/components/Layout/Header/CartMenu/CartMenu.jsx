import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { SvgIcon } from '@ui';
import { CartStoreContext, UiStoreContext } from '@store';

import styles from './CartMenu.module.scss';

const CartMenu = observer(({ className }) => {
  const { cartCount } = useContext(CartStoreContext);
  const uiContext = useContext(UiStoreContext);

  return (
    <div className={styles.cart} onClick={() => uiContext.setModal('cart')}>
      <div className={styles.cartIcon}>
        <SvgIcon name="cart" />
        {cartCount > 0 && (
          <div className={styles.cartIndicator}>
            <span>{cartCount}</span>
          </div>
        )}
      </div>

      <span>Коризна</span>
    </div>
  );
});

export default CartMenu;
