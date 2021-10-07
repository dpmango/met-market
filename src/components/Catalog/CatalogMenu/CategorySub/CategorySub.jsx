/* eslint-disable react/jsx-key */
import React, { useContext, useState, memo, useEffect, useCallback } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { UiStoreContext } from '@store';
import { useQuery, useWindowSize } from '@hooks';
import { updateQueryParams } from '@helpers';

import styles from './CategorySub.module.scss';

const CategoryMain = observer(({ category, handleCategoryClick }) => {
  const { width } = useWindowSize();

  const [opened, setOpened] = useState(false);

  const hasSub = category.categories && category.categories.length > 0;

  const handleMobileClick = useCallback(
    (category, e) => {
      if (width <= 992 && hasSub) {
        e.preventDefault();
        setOpened(!opened);
      } else {
        handleCategoryClick(category.id, e);
      }
    },
    [opened, width, hasSub]
  );

  return (
    <li key={category.id} className={cns(styles.categorySub, opened && styles._opened, hasSub && styles.hasSub)}>
      <a href={`?category=${category.id}`} onClick={(e) => handleMobileClick(category, e)}>
        {category.name}
      </a>
      {category.categories && (
        <ul className={cns(styles.categoryDropdown, opened && styles._opened)}>
          {category.categories.map((cat3) => (
            <li key={cat3.id}>
              <a href={`?category=${cat3.id}`} onClick={(e) => handleCategoryClick(cat3.id, e)}>
                {cat3.name}
              </a>
            </li>
          ))}
        </ul>
      )}
    </li>
  );
});

export default memo(CategoryMain);
