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

  const handleCategoryClick = (e, id) => {
    e.preventDefault();

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
          <a
            href={`?category=${cat.id}`}
            key={cat.id}
            className={cns(styles.button, categoryQuery === cat.id && styles._active)}
            onClick={(e) => handleCategoryClick(e, cat.id)}>
            {cat.name}
          </a>
        ))}
    </div>
  );
};

export default memo(CategoryTags);
