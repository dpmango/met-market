import React, { useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink, useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { SvgIcon } from '@ui';
import styles from './Breadcrumbs.module.scss';

const Breadcrumbs = ({ className, crumbs, ...props }) => {
  const history = useHistory();
  const location = useLocation();

  const lastCrumb = useMemo(() => {
    return crumbs[crumbs.length - 1];
  }, [crumbs]);

  const handleCategoryClick = (category, e) => {
    e.stopPropagation();
    e.preventDefault();

    const params = new URLSearchParams({
      category: `${category}`,
    });

    history.push({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  return (
    <div className={styles.breadcrumbs}>
      {crumbs && crumbs.length > 0 && (
        <ul className={styles.breadcrumbsList}>
          <li>
            <Link to="/">Главная</Link>
            <SvgIcon name="arrow-long" />
          </li>
          {crumbs.slice(0, crumbs.length - 1).map((crumb, idx) => (
            <li key={idx}>
              {crumb.href && <Link to={crumb.href}>{crumb.text}</Link>}
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
      )}
    </div>
  );
};

export default memo(Breadcrumbs);
