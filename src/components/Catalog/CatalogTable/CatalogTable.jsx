/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import Select from 'react-select';
import cns from 'classnames';

import { Pagination, Spinner, SvgIcon } from '@ui';
import { CatalogStoreContext, CartStoreContext, UiStoreContext } from '@store';
import { useQuery } from '@hooks';
import { Plurize } from '@helpers';

import styles from './CatalogTable.module.scss';

const CatalogTable = observer(() => {
  const history = useHistory();
  const query = useQuery();
  const categoryQuery = query.get('category');

  const { loading, catalog, catalogList, getCatalogItem, filters } = useContext(CatalogStoreContext);
  const { cartItemIds } = useContext(CartStoreContext);
  const uiStore = useContext(UiStoreContext);

  const columns = useMemo(() => {
    return [
      {
        Header: 'Название',
        accessor: 'name',
      },
      {
        Header: 'Размер',
        accessor: 'size',
      },
      {
        Header: 'Марка',
        accessor: 'mark',
      },
      {
        Header: 'Длина',
        accessor: 'length',
      },
      {
        Header: 'Цена с НДС',
        accessor: 'price',
      },
      {
        Header: '',
        accessor: 'id',
      },
    ];
  }, []);

  const data = useMemo(() => {
    return catalogList(categoryQuery, filters);
  }, [catalog, categoryQuery, filters]);

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
      columns,
      data,
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

      uiStore.setModal('cart-add', { ...item });
    },
    [uiStore]
  );

  return !loading ? (
    <div className={styles.catalog}>
      <div className={styles.head}>
        <div className={styles.metaCount}>{metaItemsCount}</div>
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

        <tbody {...getTableBodyProps()}>
          {page.map((row, i) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => {
                  const isIdRow = cell.column.id === 'id';

                  if (!isIdRow) {
                    return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                  } else {
                    return (
                      <td {...cell.getCellProps()}>
                        {!cartItemIds.includes(cell.value) ? (
                          <button className={styles.add} onClick={() => handleAddToCartClick(cell.value)}>
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
            );
          })}
        </tbody>
      </table>

      <div className={styles.pagination}>
        <Pagination
          page={pageIndex + 1}
          count={pageCount}
          onChange={(page) => gotoPage(page - 1)}
          canPreviousPage={canPreviousPage}
          canNextPage={canNextPage}
        />

        <div className={styles.paginationPer}>
          <span className={styles.paginationPerLabel}>Покаывать</span>
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
