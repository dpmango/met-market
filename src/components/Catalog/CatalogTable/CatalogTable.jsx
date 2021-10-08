/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, Profiler, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { Pagination, Button, Select, Spinner, SvgIcon } from '@ui';
import { CatalogStoreContext, CartStoreContext, UiStoreContext } from '@store';
import { useQuery, useFirstRender, useWindowSize } from '@hooks';
import { updateQueryParams, Plurize, ScrollTo, ProfilerLog } from '@helpers';

import StickyHead from './StickyHead';
import TableBody from './TableBody';
import styles from './CatalogTable.module.scss';
import { settings } from './dataTables';

const CatalogTable = observer(() => {
  const location = useLocation();
  const history = useHistory();
  const query = useQuery();
  const categoryQuery = query.get('category');
  const searchQuery = query.get('search');
  const productQuery = query.get('product');
  const { width } = useWindowSize();
  const catalogRef = useRef(null);

  const { catalog, loading, filters, getCatalogItem, catalogList, searchCatalog } = useContext(CatalogStoreContext);
  const { activeModal, prevModal } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);

  // router for search and regular catalog with filters
  const data = useMemo(() => {
    if (searchQuery) {
      const { meta, suggestions } = searchCatalog(searchQuery, categoryQuery);
      return suggestions;
    }

    if (categoryQuery !== 'all') {
      return catalogList(categoryQuery);
    }

    return [];
  }, [catalog, categoryQuery, searchQuery, filters]);

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
        query,
        payload: {
          type: 'product',
          value: item.id,
        },
      });
    },
    [getCatalogItem, history, location, query]
  );

  const clearQueryParams = () => {
    updateQueryParams({
      history,
      location,
      query,
      payload: {
        type: 'clear-modals',
      },
    });
  };

  useEffect(() => {
    if (!loading) {
      uiContext.checkQuery(query);
    }
  }, [loading, productQuery]);

  useEffect(() => {
    if (activeModal === null && prevModal === 'cart-add') {
      clearQueryParams();
    }
  }, [activeModal, prevModal]);

  if (categoryQuery === 'all' || (!categoryQuery && !searchQuery)) return null;

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
          <TableBody
            page={page}
            prepareRow={prepareRow}
            handleAddToCartClick={handleAddToCartClick}
            {...getTableBodyProps()}
          />
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
