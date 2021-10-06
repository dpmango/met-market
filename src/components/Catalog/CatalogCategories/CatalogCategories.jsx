/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Breadcrumbs } from '@ui';
import { CatalogStoreContext, UiStoreContext } from '@store';
import { useQuery } from '@hooks';
import { ScrollTo } from '@helpers';

import { CatalogMenu } from '@c/Catalog';
import CategoryTags from './CategoryTags';
import CategoryFilters from './CategoryFilters';
import styles from './CatalogCategories.module.scss';

const CatalogCategories = observer(() => {
  const query = useQuery();
  const category = query.get('category');
  const search = query.get('search');
  const sizeFilter = query.get('size');
  const markFilter = query.get('mark');
  const lengthFilter = query.get('length');

  const { categoriesList, searchCatalog, getCategoryFilters } = useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);
  // todo - move to crumbs conponent
  const {
    catalogOpened,
    header: { scrolled },
  } = useContext(UiStoreContext);

  // getters
  const categoryData = useMemo(() => {
    if (category) {
      return getCategoryFilters(category);
    } else if (search) {
      const data = searchCatalog(search);

      return data
        ? {
            id: 0,
            title: `По запросу «<span class="w-700 c-link">${search}</span>» ${
              data.meta.total > 0 ? `найдено ${data.meta.total} товаров` : 'ничего не найдено'
            }`,
          }
        : null;
    }
  }, [categoriesList, searchCatalog, category, search, sizeFilter, markFilter, lengthFilter]);

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

  useEffect(() => {
    ScrollTo(0, 300);
  }, [category, search]);

  useEffect(() => {
    catalogContext.queryToFilter(query);
  }, [query]);

  return (
    <div className="catalog mt-2 mb-2">
      <div className={cns(styles.breadcrumbs)}>
        <div className={cns(styles.breadcrumbsScroll, scrolled && !catalogOpened && styles._sticky)}>
          <div className="container">
            <Breadcrumbs crumbs={breadcrumbs} />
          </div>
        </div>
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
              <CategoryFilters image={categoryData.image} data={categoryData.filters} />
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
