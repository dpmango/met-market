/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Breadcrumbs } from '@ui';
import { CatalogStoreContext } from '@store';
import { useQuery } from '@hooks';

import { CatalogMenu } from '@c/Catalog';
import CategoryTags from './CategoryTags';
import CategoryFilters from './CategoryFilters';
import styles from './CatalogCategories.module.scss';

const CatalogCategories = observer(() => {
  const query = useQuery();
  const category = query.get('category');
  const search = query.get('search');

  const { categoriesList, searchCatalog, getCategoryFilters } = useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);

  // getters
  const categoryData = useMemo(() => {
    if (category) {
      return getCategoryFilters(category);
    } else if (search) {
      const data = searchCatalog(search);

      return data
        ? {
            id: 0,
            title: `По запросу «<span class="w-700 c-link">${search}</span>» найдено ${data.meta.total} товаров`,
          }
        : null;
    }
  }, [categoriesList, searchCatalog, category, search]);

  const breadcrumbs = useMemo(() => {
    if (search) {
      return [
        {
          href: '#',
          text: 'Поиск',
        },
      ];
    } else if (category && categoryData) {
      const ancestors = categoryData.ancestors
        ? categoryData.ancestors.map((x) => ({
            category: x.id,
            text: x.name,
          }))
        : [];

      return [
        {
          href: '/',
          text: 'Каталог',
        },
        ...ancestors,
        {
          text: categoryData.title,
        },
      ];
    }

    return [];
  }, [categoryData, category, search]);

  return (
    <div className="catalog mt-2 mb-2">
      <div className={styles.breadcrumbs}>
        <Breadcrumbs crumbs={breadcrumbs} />
      </div>

      {categoryData ? (
        <>
          <div className="h3-title" dangerouslySetInnerHTML={{ __html: categoryData.title }} />
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
        <CatalogMenu list={categoriesList} className="mt-2 mb-2" />
      )}
    </div>
  );
});

export default CatalogCategories;
