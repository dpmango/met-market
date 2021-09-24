import React, { useContext, useState, useRef, useCallback, useMemo } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import routes from '@config/routes';
import { Button } from '@ui';
import { AuthStoreContext } from '@store';

import styles from './Header.module.scss';

const Header = observer(({ className }) => {
  const { isAuthenticated } = useContext(AuthStoreContext);
  const auth = useContext(AuthStoreContext);

  const navLinkProps = {
    className: styles.link,
    activeClassName: styles._active,
  };

  return (
    <header className={cns(styles.header, className)}>
      <div className="container">
        <div className={styles.wrapper}>
          <h3>logo</h3>
          {isAuthenticated && (
            <nav className={styles.menu}>
              <ul>
                <li>
                  <NavLink to={routes.HOME} exact {...navLinkProps}>
                    Homepage
                  </NavLink>
                </li>
                <li>
                  <Button theme="danger" variant="small" type="button" onClick={() => auth.logout()}>
                    Log out
                  </Button>
                </li>
              </ul>
            </nav>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;
