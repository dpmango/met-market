/* eslint-disable react/jsx-key */
import React, { memo, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { UiStoreContext } from '@store';
import { updateQueryParams } from '@helpers';

import styles from './CategoryTags.module.scss';

const CategoryTags = observer(({ data }) => {
  const history = useHistory();
  const location = useLocation();

  const { query } = useContext(UiStoreContext);

  const handleCategoryClick = (e, id) => {
    e.preventDefault();

    updateQueryParams({
      location,
      history,
      payload: {
        type: 'category',
        value: `${id}`,
      },
    });
  };

  return (
    <div className={styles.tags}>
      {data &&
        data.map((cat) => (
          <a
            href={`?category=${cat.id}`}
            key={cat.id}
            className={cns(styles.button, query.category === cat.id && styles._active)}
            onClick={(e) => handleCategoryClick(e, cat.id)}>
            {cat.name}
          </a>
        ))}
    </div>
  );
});

export default memo(CategoryTags);
