import React, { useState, useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Spinner, NumInput, SvgIcon } from '@ui';
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
        <NumInput
          className={styles.numInput}
          value={product.count}
          onChange={(count) => handleUpdate(count, product)}
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
