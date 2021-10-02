/* eslint-disable react/jsx-key */
import React, { memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { useQuery } from '@hooks';

import styles from './CategoryMain.module.scss';

const CategoryMain = ({ category }) => {
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();

  const handleCategoryClick = (id) => {
    const params = new URLSearchParams({
      category: `${id}`,
    });

    history.push({
      pathname: location.pathname,
      search: params.toString(),
    });
  };

  return (
    <div className={styles.category} data-id={category.id}>
      <div className={styles.categoryTitle} onClick={() => handleCategoryClick(category.id)}>
        {category.name}
      </div>

      <ul className={styles.categoryList}>
        {category.categories &&
          category.categories.map((cat2) => (
            <li key={cat2.id}>
              <a onClick={() => handleCategoryClick(cat2.id)}>{cat2.name}</a>
              {cat2.categories && (
                <ul className={styles.categoryDropdown}>
                  {cat2.categories.map((cat3) => (
                    <li key={cat3.id}>
                      <a onClick={() => handleCategoryClick(cat3.id)}>{cat3.name}</a>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default memo(CategoryMain);
