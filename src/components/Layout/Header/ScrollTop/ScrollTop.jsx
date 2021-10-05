import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';

import { SvgIcon, Spinner } from '@ui';
import { UiStoreContext } from '@store';
import { ScrollTo } from '@helpers';

import styles from './ScrollTop.module.scss';

const ScrollTop = observer(({ visible, sticky }) => {
  const history = useHistory();
  const location = useLocation();

  const uiContext = useContext(UiStoreContext);

  return (
    <div className={cns(styles.scrolltop, visible && styles._visible, sticky && styles._sticky)}>
      <div className={styles.btn} onClick={() => ScrollTo(0, 500)}>
        <SvgIcon name="arrow-top" />
      </div>
      <div className={styles.btn} onClick={() => uiContext.setModal('callback')}>
        <SvgIcon name="phone" />
      </div>
    </div>
  );
});

export default ScrollTop;
