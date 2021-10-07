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
    <tr key={product.id} className={styles.product}>
      <td>{product.itemFullName}</td>
      <td>
        <div className={styles.cell}>
          <span className={styles.mobtitle}>Количество</span>
          <NumInput
            className={styles.numInput}
            value={product.count}
            onChange={(count) => handleUpdate(count, product)}
          />
        </div>
      </td>
      <td>
        <div className={styles.cell}>
          <span className={styles.mobtitle}>Цена с НДС</span>
          {formatPrice(product.pricePerItem, 0)}
        </div>
      </td>
      <td>
        <div className={styles.cell}>
          <span className={styles.mobtitle}>Сумма</span>
          {!loading ? <>{formatPrice(product.pricePerItem * product.count, 0)}</> : <Spinner />}
        </div>
      </td>
      <td>
        <div className={styles.delete} onClick={() => handleDeleteClick(product.itemId)}>
          <SvgIcon name="delete" />
          <span className={styles.deleteMob}>удалить товар</span>
        </div>
      </td>
    </tr>
  );
});

export default CartProduct;
