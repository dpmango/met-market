/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { CatalogStoreContext } from '@store/CatalogStore';
import { formatPrice } from '@helpers';

import styles from './CatalogCategories.module.scss';

const CatalogCategories = observer(() => {
  const history = useHistory();
  const { categoriesList } = useContext(CatalogStoreContext);

  return (
    <div className="catalog mt-2 mb-2">
      {categoriesList && categoriesList.length > 0 && (
        <div className="row">
          <div className="col col-4">
            {categoriesList.slice(0, 2).map((cat) => (
              <Category key={cat.id} category={cat} />
            ))}
          </div>
          <div className="col col-4">
            {categoriesList.slice(2, 5).map((cat) => (
              <Category key={cat.id} category={cat} />
            ))}
          </div>
          <div className="col col-4">
            {categoriesList.slice(5, 7).map((cat) => (
              <Category key={cat.id} category={cat} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
});

const Category = ({ category }) => {
  const handleCategoryClick = () => {};

  return (
    <div className={styles.category} data-id={category.id}>
      <div className={styles.categoryTitle} onClick={() => handleCategoryClick}>
        {category.name}
      </div>

      <ul className={styles.categoryList}>
        {category.categories &&
          category.categories.map((cat2) => (
            <li key={cat2.id}>
              <a href="#">{cat2.name}</a>
            </li>
          ))}
      </ul>
    </div>
  );
};

export default CatalogCategories;
