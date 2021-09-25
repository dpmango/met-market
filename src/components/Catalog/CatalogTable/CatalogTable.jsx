/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { CatalogStoreContext } from '@store/CatalogStore';
import { formatPrice } from '@helpers';

import styles from './CatalogTable.module.scss';

const CatalogTable = observer(() => {
  const history = useHistory();
  const { categories, catalog } = useContext(CatalogStoreContext);

  // console.log({ catalog });

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
        accessor: 'clengthol2',
      },
      {
        Header: 'Цена с НДС',
        accessor: 'price',
      },
      // {
      //   Header: '',
      //   accessor: '',
      // },
    ];
  }, []);

  const data = useMemo(() => {
    return catalog.map((item) => ({
      name: item.name,
      size: item.size[0],
      mark: item.mark[0],
      length: item.length[0],
      price: formatPrice(item.price),
    }));
  }, [catalog]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    // rows,
    prepareRow,

    page,
    canPreviousPage,
    canNextPage,
    pageOptions,
    pageCount,
    gotoPage,
    nextPage,
    previousPage,
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

  return (
    <div className="catalog mt-2 mb-2">
      <pre className="dev-log">{JSON.stringify(categories, null, 2)}</pre>
      <h1>Каталог</h1>
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
                  return <td {...cell.getCellProps()}>{cell.render('Cell')}</td>;
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      <div className="pagination">
        <button onClick={() => gotoPage(0)} disabled={!canPreviousPage}>
          {'<<'}
        </button>
        <button onClick={() => previousPage()} disabled={!canPreviousPage}>
          {'<'}
        </button>
        <button onClick={() => nextPage()} disabled={!canNextPage}>
          {'>'}
        </button>
        <button onClick={() => gotoPage(pageCount - 1)} disabled={!canNextPage}>
          {'>>'}
        </button>
        <span>
          Страница
          <strong>
            {pageIndex + 1} из {pageOptions.length}
          </strong>
        </span>
        Показать
        <select
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
          }}
        >
          {[25, 50, 100, 250].map((pageSize) => (
            <option key={pageSize} value={pageSize}>
              {pageSize}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

export default CatalogTable;
