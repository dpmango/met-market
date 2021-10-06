import React, { useRef, useEffect, useState, useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, Checkbox, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext, SessionStoreContext } from '@store';
import { formatPrice } from '@helpers';

import styles from './CartProduct.module.scss';

const CartProduct = observer(({ product, handleCartUpdate, handleCartDelete }) => {
  const [loading, setLoading] = useState(false);

  const handleDeleteClick = useCallback(
    async (id) => {
      if (loading) return;
      setLoading(true);

      await handleCartDelete(id);

      setLoading(false);
    },
    [loading, handleCartDelete]
  );

  const handleUpdate = useCallback(
    async (count, item) => {
      if (loading) return;
      setLoading(true);

      await handleCartUpdate(count, item);

      setLoading(false);
    },
    [loading, handleCartUpdate]
  );

  return (
    <tr key={product.id}>
      <td>{product.itemFullName}</td>
      <td>
        <Input
          className={styles.numInput}
          value={product.count}
          min="1"
          onChange={(count) => handleUpdate(count, product)}
          type="number"
        />
      </td>
      <td>{formatPrice(product.pricePerItem, 0)}</td>
      <td>{!loading ? <>{formatPrice(product.pricePerItem * product.count, 0)}</> : <Spinner />}</td>
      <td>
        <div className={styles.delete} onClick={() => handleDeleteClick(product.itemId)}>
          <SvgIcon name="delete" />
        </div>
      </td>
    </tr>
  );
});

export default CartProduct;
