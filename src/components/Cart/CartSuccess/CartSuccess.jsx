import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';

import { Modal, Spinner, Button, Input, Checkbox, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext, SessionStoreContext } from '@store';
import { formatPrice } from '@helpers';

import styles from './CartSuccess.module.scss';

const CartSuccess = observer(() => {
  const history = useHistory();

  const { modalParams } = useContext(CartStoreContext);

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
