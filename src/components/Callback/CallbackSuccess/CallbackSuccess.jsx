import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';

import { Modal, Spinner, Button, Input, Checkbox, SvgIcon } from '@ui';
import { UiStoreContext, CartStoreContext, SessionStoreContext } from '@store';
import { formatPrice, updateQueryParams } from '@helpers';

import styles from './CallbackSuccess.module.scss';

const CallbackSuccess = observer(() => {
  const history = useHistory();
  const location = useLocation();

  const { activeModal, prevModal } = useContext(UiStoreContext);
  const { modalParams } = useContext(UiStoreContext);

  useEffect(() => {
    if (prevModal === 'callbacksuccess' && activeModal === null) {
      updateQueryParams({
        location,
        history,
        payload: {
          type: 'callback',
          value: false,
        },
      });
    }
  }, [activeModal]);

  return (
    <Modal name="callbacksuccess" variant={'thanks'}>
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

export default CallbackSuccess;
