import React, { useMemo, useContext, memo } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Link, NavLink, useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { SvgIcon } from '@ui';
import { UiStoreContext } from '@store';
import { updateQueryParams } from '@helpers';

import styles from './Breadcrumbs.module.scss';

const Breadcrumbs = observer(({ className, crumbs, ...props }) => {
  const history = useHistory();
  const location = useLocation();

  // todo - move to crumbs conponent
  const {
    catalogOpened,
    header: { scrolled },
  } = useContext(UiStoreContext);

  const lastCrumb = useMemo(() => {
    return crumbs[crumbs.length - 1];
  }, [crumbs]);

  const handleCategoryClick = (category, e) => {
    e.stopPropagation();
    e.preventDefault();

    updateQueryParams({
      history,
      location,
      payload: {
        type: 'category',
        value: category && `${category}`,
      },
    });
  };

  return crumbs && crumbs.length > 0 ? (
    <div className={cns(styles.breadcrumbsScroll, scrolled && !catalogOpened && styles._sticky)}>
      <div className="container">
        <div className={styles.breadcrumbs}>
          <ul className={styles.breadcrumbsList}>
            <li>
              <a href={'/'} onClick={(e) => handleCategoryClick(null, e)}>
                Главная
              </a>

              <SvgIcon name="arrow-long" />
            </li>
            {crumbs.slice(0, crumbs.length - 1).map((crumb, idx) => (
              <li key={idx}>
                {crumb.category && (
                  <a href={`?category=${crumb.category}`} onClick={(e) => handleCategoryClick(crumb.category, e)}>
                    {crumb.text}
                  </a>
                )}
                {!crumb.href && !crumb.category && <span>{crumb.text}</span>}
                <SvgIcon name="arrow-long" />
              </li>
            ))}

            <li className={styles.last}>
              <span>{lastCrumb.text}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  ) : null;
});

export default memo(Breadcrumbs);
