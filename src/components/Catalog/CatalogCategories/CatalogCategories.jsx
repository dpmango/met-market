/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';

import { Breadcrumbs, Spinner, Button } from '@ui';
import { CatalogStoreContext, UiStoreContext } from '@store';
import { ScrollTo, Plurize, updateQueryParams } from '@helpers';
import { useWindowSize } from '@hooks';

import { CatalogMenu } from '@c/Catalog';
import CategoryTags from './CategoryTags';
import CategoryFilters from './CategoryFilters';
import styles from './CatalogCategories.module.scss';

const CatalogCategories = observer(() => {
  const history = useHistory();
  const location = useLocation();
  const { width } = useWindowSize();

  const { loading, searchCatalog, getCategoryFilters, buildFiltersFromData, filters } = useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);
  const { query } = useContext(UiStoreContext);

  // getters
  const categoryData = useMemo(() => {
    if (query.category) {
      const storeData = getCategoryFilters(query.category);

      if (query.search) {
        const { meta } = searchCatalog(query.search, query.category, null);

        //  <br/>по запросу «<span class="w-700 c-link">${search}</span>»`
        return {
          ...storeData,
          head: storeData.title,
          searchtitle: `В категории «<span class="w-700 c-link">${storeData.title}</span>» ${
            meta.total > 0
              ? `${Plurize(meta.total, 'найден', 'найдено', 'найдено')} ${meta.total} ${Plurize(
                  meta.total,
                  'товар',
                  'товара',
                  'товаров'
                )}`
              : 'ничего не найдено'
          }`,
        };
      }

      if (storeData.title) {
        return {
          ...storeData,
          head: storeData.title,
        };
      }

      return storeData;
    } else if (query.search) {
      const data = searchCatalog(query.search, null, null);

      return data
        ? {
            filters: buildFiltersFromData(data.results || []),
            id: 0,
            title: `По запросу «<span class="w-700 c-link">${query.search}</span>» ${
              data.meta.total > 0
                ? `${Plurize(data.meta.total, 'найден', 'найдено', 'найдено')} ${data.meta.total} ${Plurize(
                    data.meta.total,
                    'товар',
                    'товара',
                    'товаров'
                  )}`
                : 'ничего не найдено'
            }`,
          }
        : null;
    }
  }, [loading, query.search, query.category, filters]);

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
        type: 'delete',
        value: ['category', 'page'],
      },
    });
  }, [location, history]);

  useEffect(() => {
    ScrollTo(0, 300);

    if (!query.page) {
      setTimeout(() => {
        ScrollTo(0, 300);
      }, 300);
    }
  }, [query.category]);

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
            <span
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

          {!(query.search && width < 768) && categoryData.filters && (
            <div className={styles.filters}>
              <CategoryFilters image={categoryData.image} data={categoryData.filters} />
            </div>
          )}
        </>
      ) : !loading ? (
        <CatalogMenu type="homepage" className="mt-2 mb-2 mt-md-1 mb-md-1" />
      ) : (
        <Spinner />
      )}

      <Helmet>
        <title>{(categoryData && categoryData.head) || 'Металлопрокат'} оптом и в розницу в Москве</title>
      </Helmet>
    </div>
  );
});

export default CatalogCategories;
