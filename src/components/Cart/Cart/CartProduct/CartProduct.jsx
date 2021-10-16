import React, { useState, useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { CatalogStoreContext } from '@store';
import { Spinner, NumInput, SvgIcon } from '@ui';
import { formatPrice } from '@helpers';

import styles from './CartProduct.module.scss';

const CartProduct = observer(({ product, handleCartUpdate, handleCartDelete }) => {
  const [loading, setLoading] = useState(false);
  const catalogContext = useContext(CatalogStoreContext);

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

  const priceQuantityUnit = useMemo(() => {
    const productCat = catalogContext.getCatalogItem(product.itemId);
    if (productCat) {
      return productCat.priceQuantityUnit;
    }

    return '';
  }, [product]);

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
          {formatPrice(product.pricePerItem, 0)} ₽/
          {priceQuantityUnit}
        </div>
      </td>
      <td>
        <div className={styles.cell}>
          <span className={styles.mobtitle}>Сумма</span>
          {!loading ? (
            <>
              {formatPrice(product.pricePerItem * product.count, 0)} ₽/
              {priceQuantityUnit}
            </>
          ) : (
            <Spinner />
          )}
        </div>
      </td>
      <td>
        <div className={styles.delete} key={product.id} onClick={() => handleDeleteClick(product.itemId)}>
          <SvgIcon name="delete" />
          <span className={styles.deleteMob}>удалить товар</span>
        </div>
      </td>
    </tr>
  );
});

export default CartProduct;
