/* eslint-disable react/jsx-key */
import React, { useContext, memo, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { UiStoreContext } from '@store';
import { useQuery } from '@hooks';
import { updateQueryParams } from '@helpers';

import styles from './CategoryMain.module.scss';

const CategoryMain = observer(({ category }) => {
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();

  const { catalogOpened } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);

  const handleCategoryClick = (id) => {
    updateQueryParams({
      history,
      location,
      query,
      payload: {
        type: 'category',
        value: `${id}`,
      },
    });

    uiContext.setHeaderCatalog(false);
  };

  useEffect(() => {
    // catalogOpened
  }, [catalogOpened]);

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
});

export default memo(CategoryMain);
