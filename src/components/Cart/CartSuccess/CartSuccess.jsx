import React, { useContext, useMemo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router-dom';

import { Modal, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext } from '@store';
import { updateQueryParams } from '@helpers';

import styles from './CartSuccess.module.scss';

const CartSuccess = observer(() => {
  const history = useHistory();
  const location = useLocation();

  const { activeModal, prevModal } = useContext(UiStoreContext);
  const { modalParams } = useContext(CartStoreContext);

  useEffect(() => {
    if (prevModal === 'cartsuccess' && activeModal === null) {
      updateQueryParams({
        location,
        history,
        payload: {
          type: 'cart',
          value: false,
        },
      });
    }
  }, [activeModal]);

  return (
    <Modal name="cartsuccess" variant={'thanks'}>
      <div className={styles.modalSuccess}>
        <div className={styles.modalSuccess__icon}>
          <SvgIcon name="success" />
        </div>
        <div className={styles.modalSuccess_title}>
          Спасибо! <br />
          Ваша заявка {modalParams && `#${modalParams.orderNumber}`} принята.
        </div>
        <div className={styles.modalSuccess_text}>
          В ближайшее время наш менеджер свяжется с Вами для расчета стоимости заказа.
        </div>
      </div>
    </Modal>
  );
});

export default CartSuccess;
