import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useToasts } from 'react-toast-notifications';
import cns from 'classnames';

import { Modal, Spinner, Button, Input, NumInput, SvgIcon } from '@ui';
import { UiStoreContext, CatalogStoreContext, CartStoreContext } from '@store';
import { formatPrice } from '@helpers';

import styles from './AddToCart.module.scss';

const AddToCart = observer(() => {
  const { addToast } = useToasts();

  const { activeModal, modalParams } = useContext(UiStoreContext);
  const { getCategoryByName } = useContext(CatalogStoreContext);
  const cartContext = useContext(CartStoreContext);
  const uiContext = useContext(UiStoreContext);

  const [loading, setLoading] = useState(false);
  const [cartUpdated, setСartUpdated] = useState(true);
  const [count, setCount] = useState(1);

  const cartItem = useMemo(() => {
    if (modalParams && modalParams.id) {
      return cartContext.getItemInCart(modalParams.id);
    }

    return null;
  }, [cartContext.cart, modalParams]);

  // actions
  const handleCartSubmit = useCallback(
    async (event) => {
      event.preventDefault();
      if (loading) return;

      setLoading(true);

      const { id, price, nameFull } = modalParams;

      if (!cartItem) {
        await cartContext
          .addCartItem({ itemId: id, count, pricePerItem: price, itemFullName: nameFull })
          .then((_res) => {
            uiContext.resetModal();
          })
          .catch((_error) => {
            // dispatch({ key: 'error', value: _error });
          });
      } else {
        if (cartUpdated) {
          setLoading(false);
          return;
        }

        setСartUpdated(false);
        await cartContext
          .updateCartItem({ itemId: id, count, pricePerItem: price })
          .then((_res) => {
            setСartUpdated(true);
          })
          .catch((_error) => {
            addToast('сбой подключения, проверьте наличие интернета и попробуйте еще раз', { appearance: 'error' });
          });
      }

      setLoading(false);
    },
    [loading, cartUpdated, modalParams, count, cartItem]
  );

  const handleCartDelete = useCallback(async () => {
    const { id } = modalParams;
    setLoading(true);

    await cartContext
      .removeCartItem({ itemId: id })
      .then((_res) => {
        // history.push(routes.HOME);
      })
      .catch((_error) => {
        addToast('сбой подключения, проверьте наличие интернета и попробуйте еще раз', { appearance: 'error' });
      });

    setLoading(false);
  }, [modalParams]);

  // effects
  useEffect(() => {
    if (activeModal === null) {
      setCount(1);
    } else {
      if (cartItem) {
        setCount(cartItem.count);
      }
    }
  }, [activeModal]);

  useEffect(() => {
    setСartUpdated(false);
  }, [count]);

  // memos
  const itemCategory = useMemo(() => {
    if (!modalParams) return;
    const { cat1, cat2, cat3 } = modalParams;
    const name = cat3 || cat2 || cat1 || null;

    if (name) {
      const category = getCategoryByName(name);

      return category;
    }

    return null;
  }, [modalParams]);

  return (
    <Modal name="cart-add">
      <div className={cns(styles.cart, loading && styles._loading)}>
        {modalParams && activeModal === 'cart-add' ? (
          <>
            <div className={styles.head}>
              <div className={styles.headTitle}>{modalParams.nameFull}</div>
            </div>

            <div className={styles.body}>
              <div className={styles.bodyImage}>
                <img src={itemCategory.image} alt={itemCategory.name} />
              </div>
              <div className={styles.bodyTable}>
                <div className={styles.row}>
                  <span className={styles.rowLabel}>Тип товара</span>
                  <span className={styles.rowContent}>{itemCategory.name}</span>
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
                  <NumInput
                    label={`Количество, ${modalParams.priceQuantityUnit}`}
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
                    <Button theme="link" type="submit" loading={loading}>
                      Добавить в корзину
                    </Button>
                  ) : (
                    <Button theme="link" type="submit" disabled={cartUpdated} loading={loading}>
                      {cartUpdated ? 'Коризна обновлена' : 'Обновить в коризне'}
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
