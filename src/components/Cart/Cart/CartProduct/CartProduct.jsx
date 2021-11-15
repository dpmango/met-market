import React, { useState, useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { CatalogStoreContext } from '@store';
import { Spinner, NumInput, SvgIcon, LazyMedia } from '@ui';
import { formatPrice, priceWithTonnage } from '@helpers';

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

  const singlePriceWithTonnage = useMemo(() => {
    const { pricePerItem, count } = product;

    if (count < 1) {
      return priceWithTonnage(pricePerItem, true);
    } else {
      return pricePerItem;
    }
  }, [product]);

  const totalPriceWithTonnage = useMemo(() => {
    const { pricePerItem, count } = product;

    return priceWithTonnage(pricePerItem, count);
  }, [product]);

  const categoryImage = useMemo(() => {
    const productCat = catalogContext.getCatalogItem(product.itemId);
    if (productCat) {
      const { cat1, cat2, cat3 } = productCat;
      const name = cat3 || cat2 || cat1 || null;

      const category = catalogContext.getCategoryByName(name);

      return category.image;
    }

    return '';
  }, [product]);

  return (
    <tr key={product.id} className={styles.product}>
      <td>{product.itemFullName}</td>
      <td>
        <div className={styles.image}>
          {categoryImage ? (
            <img src={categoryImage} />
          ) : (
            <LazyMedia src={'img/search-placeholder.jpg'} width={240} height={100} />
          )}
        </div>
      </td>
      <td>
        <div className={styles.cell}>
          <span className={styles.mobtitle}>Количество, {priceQuantityUnit}</span>
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
          <span>
            {formatPrice(singlePriceWithTonnage, 0)} ₽/
            {priceQuantityUnit}
          </span>
        </div>
      </td>
      <td>
        <div className={styles.cell}>
          <span className={styles.mobtitle}>Сумма</span>
          {!loading ? <span>{formatPrice(totalPriceWithTonnage, 0)} ₽</span> : <Spinner />}
        </div>
      </td>
      <td>
        <div className={styles.delete} key={product.id} onClick={() => handleDeleteClick(product.itemId)}>
          <SvgIcon name="delete" />
        </div>
      </td>
    </tr>
  );
});

export default CartProduct;
