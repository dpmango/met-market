/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';

import { Breadcrumbs, Spinner, Button } from '@ui';
import { CatalogStoreContext, UiStoreContext } from '@store';
import { useQuery } from '@hooks';
import { ScrollTo, Plurize, updateQueryParams } from '@helpers';

import { CatalogMenu } from '@c/Catalog';
import CategoryTags from './CategoryTags';
import CategoryFilters from './CategoryFilters';
import styles from './CatalogCategories.module.scss';

const CatalogCategories = observer(() => {
  const query = useQuery();
  const history = useHistory();
  const location = useLocation();

  const category = query.get('category');
  const search = query.get('search');
  const sizeFilter = query.get('size');
  const markFilter = query.get('mark');
  const lengthFilter = query.get('length');

  const { loading, searchCatalog, getCategoryFilters } = useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);

  // getters
  const categoryData = useMemo(() => {
    if (category) {
      const storeData = getCategoryFilters(category);

      if (search) {
        const data = searchCatalog(search, category);

        //  <br/>по запросу «<span class="w-700 c-link">${search}</span>»`
        return {
          ...storeData,
          searchtitle: `В категории «<span class="w-700 c-link">${storeData.title}</span>» ${
            data.meta.total > 0
              ? `найдено ${data.meta.total} ${Plurize(data.meta.total, 'товар', 'товара', 'товаров')}`
              : 'ничего не найдено'
          }`,
        };
      }

      return storeData;
    } else if (search) {
      const data = searchCatalog(search, null);

      return data
        ? {
            id: 0,
            title: `По запросу «<span class="w-700 c-link">${search}</span>» ${
              data.meta.total > 0
                ? `найдено ${data.meta.total} ${Plurize(data.meta.total, 'товар', 'товара', 'товаров')}`
                : 'ничего не найдено'
            }`,
          }
        : null;
    }
  }, [loading, searchCatalog, category, search, sizeFilter, markFilter, lengthFilter]);

  const breadcrumbs = useMemo(() => {
    if (category && categoryData) {
      const ancestors = categoryData.ancestors
        ? categoryData.ancestors.map((x) => ({
            category: x.id,
            text: x.name,
          }))
        : [];

      return [
        {
          href: '?category=all',
          text: 'Каталог',
        },
        ...ancestors,
        {
          text: categoryData.title,
        },
      ];
    } else if (search) {
      return [
        {
          href: '#',
          text: 'Поиск',
        },
      ];
    } else if (category) {
      return [
        {
          href: '',
          text: 'Каталог',
        },
      ];
    }

    return [];
  }, [categoryData, category, search]);

  // click handlers
  const handleSearchEveryWhere = useCallback(() => {
    updateQueryParams({
      location,
      history,
      query,
      payload: {
        type: 'category',
        value: false,
      },
    });
  }, [location, history, query]);

  useEffect(() => {
    ScrollTo(0, 300);
  }, [category, search]);

  useEffect(() => {
    catalogContext.queryToFilter(query);
  }, [query]);

  return (
    <div className={cns(styles.root, 'catalog')}>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className={cns(styles.breadcrumbs)}>
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
      )}

      {categoryData ? (
        <>
          <div className={styles.head}>
            <div
              className="h3-title"
              dangerouslySetInnerHTML={{ __html: categoryData.searchtitle || categoryData.title }}
            />
            {search && categoryData.searchtitle && (
              <div className={styles.everywhere}>
                <Button theme="link" variant="small" iconLeft="search" onClick={handleSearchEveryWhere}>
                  Искать везде
                </Button>
              </div>
            )}
          </div>

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

          <Helmet>
            <title>{categoryData.searchTitle || categoryData.title || ''} оптом и в розницу в Москве</title>
          </Helmet>
        </>
      ) : !loading ? (
        <CatalogMenu className="mt-2 mb-2" />
      ) : (
        <Spinner />
      )}
    </div>
  );
});

export default CatalogCategories;
