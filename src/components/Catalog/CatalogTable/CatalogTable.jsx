/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { Pagination, Button, Select, Spinner, SvgIcon } from '@ui';
import { CatalogStoreContext, CartStoreContext, UiStoreContext } from '@store';
import { useQuery } from '@hooks';
import { Plurize, ScrollTo } from '@helpers';

import styles from './CatalogTable.module.scss';
import { settings } from './dataTables';

const CatalogTable = observer(() => {
  const location = useLocation();
  const history = useHistory();
  const query = useQuery();
  const categoryQuery = query.get('category');
  const searchQuery = query.get('search');

  const { loading, catalog, catalogList, searchCatalog, getCatalogItem, filters } = useContext(CatalogStoreContext);
  const { cartItemIds } = useContext(CartStoreContext);
  const uiContext = useContext(UiStoreContext);

  // router for search and regular catalog with filters
  const data = useMemo(() => {
    if (searchQuery) {
      const { meta, suggestions } = searchCatalog(searchQuery);
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
      initialState: { pageIndex: 0, pageSize: 50 },
    },
    usePagination
  );

  const metaItemsCount = useMemo(() => {
    const showing = pageSize >= data.length ? data.length : pageSize;
    const plural = Plurize(showing, 'товар', 'товара', 'товаров');

    return `Показано ${showing} ${plural} из ${data.length}`;
  }, [data, pageSize]);

  const handleAddToCartClick = useCallback(
    (id) => {
      const item = getCatalogItem(id);

      uiContext.setModal('cart-add', { ...item });
    },
    [getCatalogItem]
  );

  const handleCategoryClick = useCallback((item) => {
    const params = new URLSearchParams({
      category: `${item.name}`,
    });

    console.log('handleCategoryClick', item);
    // history.push({
    //   pathname: location.pathname,
    //   search: params.toString(),
    // });
  }, []);

  useEffect(() => {
    if (page) {
      ScrollTo(0, 300);
    }
  }, [page]);

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
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>

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
              }

              if (categories[categories.length - 1]) {
                if (prevRow && prevRow[prevRow.length - 1]) {
                  showGrouping = category !== prevRow[prevRow.length - 1];
                }
              }

              if (showGrouping && category) {
                groupingHeader = (
                  <tr className={styles.groupTableHeader} onClick={() => handleCategoryClick(row.original)}>
                    <td colSpan="6">{category}</td>
                  </tr>
                );
              }

              return (
                <>
                  {groupingHeader}
                  <tr
                    {...row.getRowProps()}
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
          onChange={(page) => gotoPage(page - 1)}
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
