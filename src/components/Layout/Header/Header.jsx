import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import routes from '@config/routes';
import { Button } from '@ui';
// import { AuthStoreContext } from '@store';

import styles from './Header.module.scss';

const Header = observer(({ className }) => {
  // const { isAuthenticated } = useContext(AuthStoreContext);
  // const auth = useContext(AuthStoreContext);

  return (
    <header className={cns(styles.header, className)}>
      <div className="container">
        <div className={styles.wrapper}>
          <h3>logo</h3>
        </div>
      </div>
    </header>
  );
});

export default Header;
