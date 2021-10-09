import React, { useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { SvgIcon } from '@ui';
import { CartStoreContext, UiStoreContext } from '@store';

import styles from './CartMenu.module.scss';

const CartMenu = observer(({ className, showLabel }) => {
  const { cartCount } = useContext(CartStoreContext);
  const uiContext = useContext(UiStoreContext);

  return (
    <div className={cns('cart', styles.cart, className)} onClick={() => uiContext.setModal('cart')}>
      <div className={styles.cartIcon}>
        <SvgIcon name="cart" />
        {cartCount > 0 && (
          <div className={styles.cartIndicator}>
            <span>{cartCount}</span>
          </div>
        )}
      </div>
      {showLabel && <span>Корзина</span>}
    </div>
  );
});

CartMenu.propTypes = {
  className: PropTypes.string,
  showLabel: PropTypes.bool,
};

CartMenu.defaultProps = {
  showLabel: true,
};

export default CartMenu;
