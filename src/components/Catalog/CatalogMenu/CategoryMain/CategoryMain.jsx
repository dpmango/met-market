/* eslint-disable react/jsx-key */
import React, { useContext, useState, memo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { UiStoreContext } from '@store';
import { updateQueryParams, EVENTLIST, logEvent } from '@helpers';
import { useWindowSize } from '@hooks';

import CategorySub from '../CategorySub';
import styles from './CategoryMain.module.scss';

const CategoryMain = observer(({ category, mobOpened, setMobOpened, type }) => {
  const history = useHistory();
  const location = useLocation();
  const { width } = useWindowSize();

  const uiContext = useContext(UiStoreContext);
  const { catalogOpened } = useContext(UiStoreContext);

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

    const logFrom = type === 'homepage' ? 'main' : width < 768 ? 'popupMobile' : 'popup';
    logEvent({ name: EVENTLIST.CLICK_CATEGORY, params: { from: logFrom, categoryId: id } });

    uiContext.setHeaderCatalog(false);
  };

  const handleMobOpened = (id, state) => {
    if (state) {
      setMobOpened([id]);
    } else {
      setMobOpened([]);
    }
  };

  useEffect(() => {
    setMobOpened([]);
  }, [catalogOpened]);

  return (
    <div className={cns('category', styles.category)} data-id={category.id}>
      <a
        href={`?category=${category.id}`}
        className={cns(styles.categoryTitle, 'categoryTitle')}
        onClick={(e) => handleCategoryClick(category.id, e)}>
        {category.name}
      </a>

      <ul className={styles.categoryList}>
        {category.categories &&
          category.categories.map((cat2) => (
            <CategorySub
              key={cat2.id}
              opened={mobOpened.includes(cat2.id)}
              setOpened={(state) => handleMobOpened(cat2.id, state)}
              category={cat2}
              handleCategoryClick={handleCategoryClick}
            />
          ))}
      </ul>
    </div>
  );
});

export default memo(CategoryMain);
