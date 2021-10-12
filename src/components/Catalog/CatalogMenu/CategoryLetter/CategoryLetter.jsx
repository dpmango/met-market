/* eslint-disable react/jsx-key */
import React, { useContext, useState, memo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { UiStoreContext } from '@store';
import { updateQueryParams } from '@helpers';

import styles from './CategoryLetter.module.scss';

const CategoryLetter = observer(({ list }) => {
  const history = useHistory();
  const location = useLocation();

  const uiContext = useContext(UiStoreContext);

  const handleCategoryClick = (id, e) => {
    e && e.preventDefault();

    updateQueryParams({
      history,
      location,
      payload: {
        type: 'category',
        value: `${id}`,
      },
    });

    uiContext.setHeaderCatalog(false);
  };

  return (
    <div className={cns('letterCategory', styles.letterCategory)}>
      {list &&
        list.map((cat) => (
          <a
            href={`?category=${cat.id}`}
            className={styles.categoryTitle}
            onClick={(e) => handleCategoryClick(cat.id, e)}>
            {cat.short || cat.name}
          </a>
        ))}
    </div>
  );
});

export default memo(CategoryLetter);
