import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext } from '@store';
import { useQuery } from '@hooks';
import { formatPrice } from '@helpers';

import styles from './AddToCart.module.scss';

const AddToCart = observer(() => {
  const history = useHistory();
  const query = useQuery();
  const { activeModal, modalParams } = useContext(UiStoreContext);
  const cartContext = useContext(CartStoreContext);

  const [count, setCount] = useState(1);

  const cartItem = useMemo(() => {
    if (modalParams && modalParams.id) {
      return cartContext.getItemInCart(modalParams.id);
    }

    return null;
  }, [cartContext.cart, modalParams]);

  // actions
  const handleCartSubmit = useCallback(
    (event) => {
      event.preventDefault();

      const { id, price, nameFull } = modalParams;

      if (!cartItem) {
        cartContext
          .addCartItem({ itemId: id, count, pricePerItem: price, itemFullName: nameFull })
          .then((_res) => {
            // history.push(routes.HOME);
          })
          .catch((_error) => {
            // dispatch({ key: 'error', value: _error });
          });
      } else {
        cartContext
          .updateCartItem({ itemId: id, count, pricePerItem: price })
          .then((_res) => {
            // history.push(routes.HOME);
          })
          .catch((_error) => {
            // dispatch({ key: 'error', value: _error });
          });
      }
    },
    [modalParams, count, cartItem]
  );

  const handleCartDelete = useCallback(() => {
    const { id } = modalParams;

    cartContext
      .removeCartItem({ itemId: id })
      .then((_res) => {
        // history.push(routes.HOME);
      })
      .catch((_error) => {
        // dispatch({ key: 'error', value: _error });
      });
  }, [modalParams]);

  useEffect(() => {
    if (activeModal === null) {
      setCount(1);
    }
  }, [activeModal]);

  return (
    <Modal name="cart-add">
      <div className={styles.cart}>
        {modalParams && activeModal === 'cart-add' ? (
          <>
            <div className={styles.head}>
              <div className={styles.headTitle}>{modalParams.nameFull}</div>
            </div>

            <div className={styles.body}>
              <div className={styles.bodyImage}>
                <img src="img/categoryPlaceholder.png" />
              </div>
              <div className={styles.bodyTable}>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Тип товара</span>
                  <span className={styles.rowContent}>{modalParams.name}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Код товара</span>
                  <span className={styles.rowContent}>{modalParams.id}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Размер</span>
                  <span className={styles.rowContent}>{modalParams.size[0]}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Марка</span>
                  <span className={styles.rowContent}>{modalParams.mark[0]}</span>
                </div>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Длина</span>
                  <span className={styles.rowContent}>{modalParams.length[0]}</span>
                </div>
              </div>
            </div>

            {cartItem && (
              <div className={styles.incart}>
                <div className={styles.incartIcon}>
                  <SvgIcon name="cart-mini" />
                </div>
                <div className={styles.incartTitle}>
                  В корзине {cartItem.count} {modalParams.priceQuantityUnit} на сумму{' '}
                  {formatPrice(cartItem.pricePerItem * cartItem.count, 0)} ₽/
                  {modalParams.priceQuantityUnit}
                </div>
                <div className={styles.incartDelete} onClick={handleCartDelete}>
                  <SvgIcon name="delete" />
                </div>
              </div>
            )}

            <form className={styles.actions} onSubmit={handleCartSubmit}>
              <div className={styles.actionsWrapper}>
                <div className={styles.actionCol}>
                  <Input
                    label={`Количество, ${modalParams.priceQuantityUnit}`}
                    placeholder=""
                    type="number"
                    min="1"
                    value={count}
                    onChange={(v) => setCount(v)}
                  />
                </div>

                <div className={styles.actionCol}>
                  <Input
                    label="Цена с НДС"
                    placeholder=""
                    value={`${formatPrice(modalParams.price, 0)} /${modalParams.priceQuantityUnit}`}
                    disabled
                  />
                </div>
                <div className={styles.actionCol}>
                  <Input
                    label="Сумма"
                    placeholder=""
                    value={`${formatPrice(modalParams.price * count, 0)} /${modalParams.priceQuantityUnit}`}
                    disabled
                  />
                </div>
                <div className={cns(styles.actionCol, styles.wide)}>
                  {!cartItem ? (
                    <Button theme="link" type="submit">
                      Добавить в корзину
                    </Button>
                  ) : (
                    <Button theme="link" type="submit">
                      Обновить в корзине
                    </Button>
                  )}
                </div>
              </div>
            </form>
          </>
        ) : (
          <Spinner />
        )}
      </div>

      {/* <div className="dev-log">{JSON.stringify(cartContext.cart, null, 2)}</div> */}
    </Modal>
  );
});

export default AddToCart;
