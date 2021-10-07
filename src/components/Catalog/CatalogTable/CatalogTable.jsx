/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { Pagination, Button, Select, Spinner, SvgIcon } from '@ui';
import { CatalogStoreContext, CartStoreContext, UiStoreContext } from '@store';
import { useQuery, useFirstRender, useWindowSize } from '@hooks';
import { updateQueryParams, Plurize, ScrollTo } from '@helpers';

import StickyHead from './StickyHead';
import styles from './CatalogTable.module.scss';
import { settings } from './dataTables';

const CatalogTable = observer(() => {
  const location = useLocation();
  const history = useHistory();
  const query = useQuery();
  const categoryQuery = query.get('category');
  const searchQuery = query.get('search');
  const productQuery = query.get('product');
  const firstRender = useFirstRender();
  const { width } = useWindowSize();

  const { loading, catalog, catalogList, searchCatalog, getCatalogItem, getCategoryByName, filters } =
    useContext(CatalogStoreContext);
  const { cartItemIds } = useContext(CartStoreContext);
  const { activeModal, prevModal, modalParams } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);

  // router for search and regular catalog with filters
  const data = useMemo(() => {
    if (searchQuery) {
      const { meta, suggestions } = searchCatalog(searchQuery, categoryQuery);
      return suggestions;
    }

    return catalogList(categoryQuery, filters);
  }, [catalog, categoryQuery, searchQuery, filters, searchCatalog]);

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
      setPageSize(50);
    } else {
      setPageSize(100);
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

  const handleCategoryClick = (cat_name) => {
    const category = getCategoryByName(cat_name);

    updateQueryParams({
      history,
      location,
      query,
      payload: {
        type: 'category',
        value: `${category.id}`,
      },
    });
  };

  if (!categoryQuery && !searchQuery) return null;

  return !loading ? (
    <div className={styles.catalog}>
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
              prepareRow(row);

              // Custom grouping functionality
              const prevRow = page[i - 1] && page[i - 1].original.category.split('||');
              const categories = row.original.category.split('||');
              let category = categories ? categories[categories.length - 1] : null;
              let showGrouping = false;
              let groupingHeader = null;

              if (!prevRow || prevRow.length === 0) {
                showGrouping = true;

                if (category === null || category === 'null') {
                  category = categories[categories.length - 2];
                }
              }

              if (categories[categories.length - 1]) {
                if (prevRow && prevRow[prevRow.length - 1]) {
                  let prevRowValue = prevRow[prevRow.length - 1];
                  if (prevRowValue === null || prevRowValue === 'null') {
                    try {
                      prevRowValue = prevRow[prevRow.length - 2];
                    } catch {}
                  }

                  if (prevRowValue !== null || prevRowValue !== 'null') {
                    category = prevRowValue;
                    showGrouping = category !== prevRowValue;
                  }
                }
              }

              if (showGrouping) {
                groupingHeader = (
                  <tr key={category} className={styles.groupTableHeader} onClick={() => handleCategoryClick(category)}>
                    <td colSpan="6">{category}</td>
                  </tr>
                );
              }

              return (
                <>
                  {groupingHeader}
                  <tr
                    {...row.getRowProps()}
                    data-id={row.cells[row.cells.length - 1].value}
                    onClick={() => handleAddToCartClick(row.cells[row.cells.length - 1].value)}>
                    {row.cells.map((cell) => {
                      const isIdRow = cell.column.id === 'id';

                      if (!isIdRow) {
                        return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                      } else {
                        return (
                          <td {...cell.getCellProps()}>
                            {!cartItemIds.includes(cell.value) ? (
                              <button className={styles.add}>
                                <SvgIcon name="cart-add" />
                              </button>
                            ) : (
                              <div className={styles.addedItem}>
                                <SvgIcon name="checkmark" />
                              </div>
                            )}
                          </td>
                        );
                      }
                    })}
                  </tr>
                </>
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
            ScrollTo(0, 300);
          }}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
        />

        <div className={styles.paginationPer}>
          <span className={styles.paginationPerLabel}>Показывать</span>
          <Select
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
