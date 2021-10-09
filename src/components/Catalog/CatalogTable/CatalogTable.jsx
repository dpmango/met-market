/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, Profiler, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { Pagination, Button, Select, Spinner, SvgIcon } from '@ui';
import { CatalogStoreContext, CartStoreContext, UiStoreContext } from '@store';
import { useFirstRender, useWindowSize } from '@hooks';
import { updateQueryParams, Plurize, ScrollTo, ProfilerLog } from '@helpers';

import StickyHead from './StickyHead';
import TableBody from './TableBody';
import styles from './CatalogTable.module.scss';
import { settings } from './dataTables';

const CatalogTable = observer(() => {
  const location = useLocation();
  const history = useHistory();

  const { width } = useWindowSize();
  const catalogRef = useRef(null);

  const { catalog, loading, filters, getCatalogItem, searchCatalog, getCategoryByName } =
    useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);
  const { activeModal, prevModal, query } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);

  // router for search and regular catalog with filters
  const data = useMemo(() => {
    if (query.search) {
      const { meta, suggestions } = searchCatalog(query.search, query.category);
      return suggestions;
    }

    if (query.category !== 'all') {
      return catalogContext.catalogList(query.category);
    }

    return [];
  }, [catalog, query.category, query.search, filters]);

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
      initialState: { pageIndex: 0, pageSize: 100 },
    },
    usePagination
  );

  useEffect(() => {
    if (width < 768) {
      if (pageSize === 100) setPageSize(50);
    } else {
      if (pageSize === 50) setPageSize(100);
    }
  }, [width]);

  const metaItemsCount = useMemo(() => {
    const showing = pageSize >= data.length ? data.length : pageSize;
    const plural = Plurize(showing, 'товар', 'товара', 'товаров');

    return `Показано ${showing} ${plural} из ${data.length}`;
  }, [data, pageSize]);

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
    },
    [history, location]
  );

  useEffect(() => {
    if (!loading) {
      uiContext.checkQuery(query.origin);
    }
  }, [loading, query.product]);

  useEffect(() => {
    if (activeModal === null && prevModal === 'cart-add') {
      updateQueryParams({
        history,
        location,
        payload: {
          type: 'clear-modals',
        },
      });
    }
  }, [activeModal, prevModal]);

  useEffect(() => {
    if (pageIndex) {
      updateQueryParams({
        history,
        location,
        payload: {
          type: 'page',
          value: pageIndex,
        },
      });
    }
  }, [pageIndex]);

  if (query.category === 'all' || (!query.category && !query.search)) return null;

  return !loading ? (
    <div className={styles.catalog} ref={catalogRef}>
      <div className={styles.head}>
        <div className={styles.metaCount}>{metaItemsCount}</div>
        <Button theme="accent" className={styles.headCta} onClick={() => uiContext.setModal('callback')}>
          Заказать металлопродукцию
        </Button>
      </div>

      <table {...getTableProps()} className={styles.table}>
        <StickyHead headerGroups={headerGroups} />
        {page && page.length > 0 && (
          <tbody {...getTableBodyProps()}>
            {page.map((row, i) => {
              // Custom grouping functionality
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
                  <TableBody row={row} prepareRow={prepareRow} handleAddToCartClick={handleAddToCartClick} />
                </>
              ) : (
                <TableBody row={row} prepareRow={prepareRow} handleAddToCartClick={handleAddToCartClick} />
              );
            })}
          </tbody>
        )}
      </table>

      {page && page.length === 0 && <div className={styles.notFound}>Ничего не найдено</div>}
      <div className={styles.pagination}>
        <Pagination
          page={pageIndex + 1}
          count={pageCount}
          onChange={(page) => {
            gotoPage(page - 1);
            ScrollTo(catalogRef.current.offsetTop - 60, 300);
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
