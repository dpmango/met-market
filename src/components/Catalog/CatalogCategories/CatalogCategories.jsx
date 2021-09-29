/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { CatalogStoreContext } from '@store/CatalogStore';
import { useQuery } from '@hooks';

import CategoryMain from './CategoryMain';
import CategoryTags from './CategoryTags';
import CategoryFilters from './CategoryFilters';
import styles from './CatalogCategories.module.scss';

const CatalogCategories = observer(() => {
  const { categoriesList, getCategoryFilters } = useContext(CatalogStoreContext);
  const query = useQuery();
  const category = query.get('category');

  const categoryData = useMemo(() => {
    if (category) {
      return getCategoryFilters(category);
    }
  }, [categoriesList, category]);

  return (
    <div className="catalog mt-2 mb-2">
      {categoryData ? (
        <>
          <div className="h3-title">{categoryData.title}</div>
          {categoryData.subcategories && (
            <div className={styles.tags}>
              <CategoryTags data={categoryData.subcategories} />
            </div>
          )}

          {categoryData.filters && (
            <div className={styles.filters}>
              <CategoryFilters data={categoryData.filters} />
            </div>
          )}
        </>
      ) : (
        <>
          {categoriesList && categoriesList.length > 0 && (
            <div className="row">
              <div className="col col-4">
                {categoriesList.slice(0, 2).map((cat) => (
                  <CategoryMain key={cat.id} category={cat} />
                ))}
              </div>
              <div className="col col-4">
                {categoriesList.slice(2, 5).map((cat) => (
                  <CategoryMain key={cat.id} category={cat} />
                ))}
              </div>
              <div className="col col-4">
                {categoriesList.slice(5, 7).map((cat) => (
                  <CategoryMain key={cat.id} category={cat} />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
});

export default CatalogCategories;
