import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import cns from 'classnames';

import { Button, SvgIcon } from '@ui';

import styles from './ResetCart.module.scss';

const ResetCart = ({ className, handleCartDelete, active, setResetContext }) => {
  return (
    <div className={cns(styles.reset, active && styles._active, className)} onClick={(e) => e.stopPropagation()}>
      <div className={styles.resetTitle}>Очистить корзину?</div>
      <div className={styles.resetCta}>
        <Button theme="gray" onClick={() => handleCartDelete('batch')}>
          Да
        </Button>
        <Button theme="danger" onClick={() => setResetContext(false)}>
          Отмена
        </Button>
      </div>
    </div>
  );
};

export default ResetCart;
