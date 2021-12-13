/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, Profiler, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';
import { useDebouncedCallback } from 'use-debounce';

import { Pagination, Button, Select, Spinner, SvgIcon } from '@ui';
import { CatalogStoreContext, UiStoreContext, SessionStoreContext } from '@store';
import { updateQueryParams, Plurize, ScrollTo, ProfilerLog, EVENTLIST, logEvent } from '@helpers';
import { useWindowSize, useFirstRender } from '@hooks';

import StickyHead from './StickyHead';
import MobileFilter from './MobileFilter';
import TableBody from './TableBody';
import styles from './CatalogTable.module.scss';
import { settings } from './dataTables';

const CatalogTable = observer(() => {
  const location = useLocation();
  const history = useHistory();
  const firstRender = useFirstRender();

  const { width } = useWindowSize();
  const catalogRef = useRef(null);

  const {
    catalog,
    loading,
    filters,
    getCatalogItem,
    searchCatalog,
    getCategoryByName,
    getCategoryFilters,
    buildFiltersFromData,
  } = useContext(CatalogStoreContext);

  const catalogContext = useContext(CatalogStoreContext);
  const { pageLoaded, activeModal, prevModal, query } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);
  const sessionContext = useContext(SessionStoreContext);

  // helper function
  const getIndexFromQuery = (query) => {
    return query.page ? parseInt(query.page || 1, 10) - 1 : 0;
  };

  // router for search and regular catalog with filters
  const data = useMemo(() => {
    let returnable = [];
    if (query.search) {
      const { results } = searchCatalog(query.search, query.category, null);

      returnable = results;
    } else if (query.category !== 'all') {
      const { results } = catalogContext.catalogList(query.category, null);
      returnable = results;
    }

    return returnable;
  }, [loading, catalog, query.category, query.search, filters]);

  const categoryExists = useMemo(() => {
    if (query.category) {
      return catalogContext.getCategoryById(query.category);
    }

    return true;
  }, [catalog, query.category]);

  // controlled table state
  const [pageIndexControled, setPageIndex] = useState(getIndexFromQuery(query));

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // rows,
    prepareRow,

    page,
    canPreviousPage,
    canNextPage,
    pageCount,
    gotoPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns: settings.columns || [],
      data: data,
      initialState: { pageIndex: pageIndexControled, pageSize: 100 },
    },
    usePagination
  );

  const metaItemsCount = useMemo(() => {
    const showing = pageSize >= data.length ? data.length : pageSize;
    const pluralShowing = Plurize(showing, 'Показан', 'Показано', 'Показано');
    const pluralProduct = Plurize(showing, 'товар', 'товара', 'товаров');

    return `${pluralShowing} ${showing} ${pluralProduct} из ${data.length}`;
  }, [data, pageSize]);

  /////////////////
  // click handlers
  /////////////////
  const handleAddToCartClick = useCallback(
    (id) => {
      const item = getCatalogItem(id);
      // uiContext.setModal('cart-add', { ...item });

      updateQueryParams({
        history,
        location,
        payload: {
          type: 'product',
          value: item.idUnique,
        },
      });

      logEvent({ name: EVENTLIST.CLICK_PRODUCT, params: { from: 'row', productId: item.idUnique } });
    },
    [getCatalogItem, history, location]
  );

  const getCategoryId = useCallback(
    (cat_name) => {
      return getCategoryByName(cat_name).id;
    },
    [getCategoryByName]
  );

  const handleCategoryClick = useCallback(
    (cat_name, e) => {
      e & e.preventDefault();
      const category = getCategoryByName(cat_name);

      updateQueryParams({
        history,
        location,
        payload: {
          type: 'category',
          value: `${category.id}`,
        },
      });

      logEvent({ name: EVENTLIST.CLICK_CATEGORY, params: { from: 'productList', categoryId: category.id } });
    },
    [history, location]
  );

  const handleFiltersSelect = useCallback(() => {
    const offsetPoint = width < 768 ? 16 : 60;
    ScrollTo(catalogRef.current.offsetTop - offsetPoint, 300);
  }, [catalogRef, width]);

  const handleSearchEverywhere = useCallback(() => {
    updateQueryParams({
      location,
      history,
      payload: {
        type: 'delete',
        value: ['category', 'page'],
      },
    });
  }, [location, history]);

  //////////
  // effects
  //////////
  useEffect(() => {
    if (!loading) {
      uiContext.checkQuery(query.origin);
    }
  }, [query.product, catalog]);

  // set default page size mobile/desktop
  useEffect(() => {
    if (width < 768) {
      if (pageSize === 100) setPageSize(50);
    } else {
      if (pageSize === 50) setPageSize(100);
    }
  }, [width]);

  // product modal cleaner
  useEffect(() => {
    if (activeModal === null && prevModal === 'cart-add') {
      updateQueryParams({
        history,
        location,
        payload: {
          type: 'product',
          value: false,
        },
      });
    }
  }, [activeModal, prevModal]);

  // page query params controlled
  useEffect(() => {
    gotoPage(getIndexFromQuery(query));
    setPageIndex(getIndexFromQuery(query));
    if (catalogRef.current && !firstRender && query.page) {
      const offsetPoint = width < 768 ? 16 : 60;

      ScrollTo(catalogRef.current.offsetTop - offsetPoint, 300);
    }
  }, [query.page]);

  // filters data
  const categoryData = useMemo(() => {
    if (query.category) {
      return getCategoryFilters(query.category);
    } else if (query.search) {
      return {
        filters: buildFiltersFromData(data),
      };
    }

    return null;
  }, [loading, query.category, query.search, filters, data]);

  useEffect(() => {
    if (pageIndexControled > pageCount) {
      setPageIndex(0);
      updateQueryParams({
        history,
        location,
        payload: {
          type: 'page',
          value: 0,
        },
      });
    }
  }, [pageSize]);

  const logCatalog = () => {
    window.logCatalogEvent &&
      window.logCatalogEvent({
        categoryId: query.category,
        searchTerm: sessionContext.savedSearch,
        filterSize: filters.size.map((x) => x.value),
        filterMark: filters.mark.map((x) => x.value),
        filterLength: filters.length.map((x) => x.value),
        productsCount: data.length,
      });
  };

  const logCatalogDebounce = useDebouncedCallback(() => {
    logCatalog();
  }, 400);

  useEffect(() => {
    logCatalogDebounce();
  }, [pageLoaded, query.category, query.size, query.mark, query.length, query.search]);

  // do not render table on homepage
  if (query.category === 'all' || (!query.category && !query.search) || !categoryExists) return null;

  return !loading ? (
    <div className={cns(styles.catalog, 'catalogTable')} ref={catalogRef}>
      <div className={styles.head}>
        <div className={styles.metaCount}>{metaItemsCount}</div>
        <Button
          theme="accent"
          className={styles.headCta}
          onClick={() => {
            uiContext.setModal('callback');
            logEvent({ name: EVENTLIST.CLICK_OPENFORM_RFQ, params: { from: 'productList' } });
          }}>
          Заказать металлопродукцию
        </Button>
      </div>

      <MobileFilter metaItemsCount={metaItemsCount} categoryData={categoryData} onSelect={handleFiltersSelect} />

      <table {...getTableProps()} className={styles.table}>
        <StickyHead headerGroups={headerGroups} categoryData={categoryData} onSelect={handleFiltersSelect} />

        {page && page.length > 0 && (
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              // Custom grouping functionality (no such grouping included in react-table)
              const prevRow = page[i - 1] && page[i - 1].original.category.split('||');
              const categories = row.original.category.split('||');
              let category = categories ? categories[categories.length - 1] : null;
              let showGrouping = false;
              let groupingHeader = null;

              const isNull = (x) => x === null || x === 'null';
              const isNotNull = (x) => x !== null || x !== 'null';

              if (!prevRow || prevRow.length === 0) {
                showGrouping = true;

                if (isNull(category)) {
                  category = categories[categories.length - 2];
                }
              }

              if (categories[categories.length - 1]) {
                let prevRowValue = null;

                if (prevRow && prevRow[prevRow.length - 1]) {
                  prevRowValue = prevRow[prevRow.length - 1];
                  if (isNull(prevRowValue)) {
                    prevRowValue = prevRow[prevRow.length - 2];
                  }
                }

                if (isNull(category)) {
                  category = categories[categories.length - 2];
                }

                if (isNotNull(prevRowValue)) {
                  showGrouping = category !== prevRowValue;
                  category = isNotNull(category) ? category : prevRowValue;
                }
              }

              if (showGrouping) {
                groupingHeader = (
                  <tr className={styles.groupTableHeader}>
                    <td colSpan="6">
                      <a
                        href={`?category=${getCategoryId(category)}`}
                        onClick={(e) => handleCategoryClick(category, e)}>
                        {category}
                      </a>
                    </td>
                  </tr>
                );
              }

              return groupingHeader ? (
                <>
                  {groupingHeader}
                  <TableBody key={i} row={row} prepareRow={prepareRow} handleAddToCartClick={handleAddToCartClick} />
                </>
              ) : (
                <TableBody key={i} row={row} prepareRow={prepareRow} handleAddToCartClick={handleAddToCartClick} />
              );
            })}
          </tbody>
        )}
      </table>

      {page && page.length === 0 && (
        <div className={styles.notFound}>
          Ничего не найдено
          {query.category && query.search && !query.size && !query.mark && !query.length && (
            <>
              <i>.&nbsp;</i>
              <span onClick={() => handleSearchEverywhere()}>Искать везде?</span>
            </>
          )}
        </div>
      )}

      <div className={styles.pagination}>
        <Pagination
          page={pageIndexControled + 1}
          count={pageCount}
          onChange={(page) => {
            // gotoPage(page - 1);
            updateQueryParams({
              history,
              location,
              payload: {
                type: 'page',
                value: page,
              },
            });
          }}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
        />

        <div className={styles.paginationPer}>
          <span className={styles.paginationPerLabel}>Показывать</span>
          <Select
            variant="small"
            value={{ label: pageSize, value: pageSize }}
            onChange={(v) => setPageSize(v.value)}
            options={[
              { value: 25, label: 25 },
              { value: 50, label: 50 },
              { value: 100, label: 100 },
              { value: 250, label: 250 },
            ]}
          />
        </div>
      </div>
    </div>
  ) : (
    <div className={styles.loading}>
      <Spinner />
    </div>
  );
});

export default CatalogTable;
