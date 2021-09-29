/* eslint-disable react/jsx-key */
import React, { memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { useQuery } from '@hooks';

import styles from './CategoryTags.module.scss';

const CategoryTags = ({ data }) => {
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();
  const categoryQuery = query.get('category');

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
    <div className={styles.tags}>
      {data &&
        data.map((cat) => (
          <button
            key={cat.id}
            className={cns(styles.button, categoryQuery === cat.id && 'is-active')}
            onClick={() => handleCategoryClick(cat.id)}
          >
            {cat.name}
          </button>
        ))}
    </div>
  );
};

export default memo(CategoryTags);
