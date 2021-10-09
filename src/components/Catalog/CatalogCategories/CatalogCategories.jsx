/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';

import { Breadcrumbs, Spinner, Button } from '@ui';
import { CatalogStoreContext, UiStoreContext } from '@store';
import { ScrollTo, Plurize, updateQueryParams } from '@helpers';

import { CatalogMenu } from '@c/Catalog';
import CategoryTags from './CategoryTags';
import CategoryFilters from './CategoryFilters';
import styles from './CatalogCategories.module.scss';

const CatalogCategories = observer(() => {
  const history = useHistory();
  const location = useLocation();

  const { loading, searchCatalog, getCategoryFilters, filters } = useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);
  const { query } = useContext(UiStoreContext);

  // getters
  const categoryData = useMemo(() => {
    if (query.category) {
      const storeData = getCategoryFilters(query.category);

      if (query.search) {
        const data = searchCatalog(query.search, query.category);

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
    } else if (query.search) {
      const data = searchCatalog(query.search, null);

      return data
        ? {
            id: 0,
            title: `По запросу «<span class="w-700 c-link">${query.search}</span>» ${
              data.meta.total > 0
                ? `найдено ${data.meta.total} ${Plurize(data.meta.total, 'товар', 'товара', 'товаров')}`
                : 'ничего не найдено'
            }`,
          }
        : null;
    }
  }, [loading, searchCatalog, query.search, query.category, filters]);

  const breadcrumbs = useMemo(() => {
    if (query.category && categoryData) {
      const ancestors = categoryData.ancestors
        ? categoryData.ancestors.map((x) => ({
            category: x.id,
            text: x.name,
          }))
        : [];

      return [
        {
          category: 'all',
          text: 'Каталог',
        },
        ...ancestors,
        {
          text: categoryData.title,
        },
      ];
    } else if (query.search) {
      return [
        {
          href: '#',
          text: 'Поиск',
        },
      ];
    } else if (query.category) {
      return [
        {
          category: 'all',
          text: 'Каталог',
        },
      ];
    }

    return [];
  }, [categoryData, query.category, query.search]);

  // click handlers
  const handleSearchEveryWhere = useCallback(() => {
    updateQueryParams({
      location,
      history,
      payload: {
        type: 'category',
        value: false,
      },
    });
  }, [location, history]);

  useEffect(() => {
    ScrollTo(0, 300);
  }, [query.category, query.search]);

  // todo - ?? ?
  useEffect(() => {
    catalogContext.queryToFilter(query.origin);
  }, [query.size, query.mark, query.length]);

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
            {query.search && categoryData.searchtitle && (
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
