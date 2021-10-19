import React, { useContext, useMemo, useCallback } from 'react';
import { observer } from 'mobx-react';

import { Modal, SvgIcon } from '@ui';
import { UiStoreContext } from '@store';

import styles from './CartSuccess.module.scss';

const CartSuccess = observer(() => {
  const { modalParams } = useContext(UiStoreContext);

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
