/* eslint-disable react/jsx-key */
import React, { useContext, useState, memo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { UiStoreContext } from '@store';
import { useWindowSize } from '@hooks';
import { updateQueryParams, EVENTLIST, logEvent } from '@helpers';

import styles from './CategoryLetter.module.scss';

const CategoryLetter = observer(({ list }) => {
  const history = useHistory();
  const location = useLocation();
  const { width } = useWindowSize();

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

    logEvent({
      name: EVENTLIST.CLICK_CATEGORY,
      params: { from: width < 768 ? 'popupAbcMobile' : 'popupAbc', categoryId: id },
    });

    uiContext.setHeaderCatalog(false);
  };

  return (
    <div className={cns('letterCategory', styles.letterCategory)}>
      {list &&
        list.map((cat) => (
          <a
            href={`?category=${cat.id}`}
            className={cns(
              styles.categoryLetterTitle,
              cat.highlight && styles._highlight,
              cat.isLastHightlight && styles._last
            )}
            onClick={(e) => handleCategoryClick(cat.id, e)}
            dangerouslySetInnerHTML={{ __html: cat.short || cat.name }}></a>
        ))}
    </div>
  );
});

export default memo(CategoryLetter);
