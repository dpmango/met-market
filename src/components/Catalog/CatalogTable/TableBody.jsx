/* eslint-disable react/jsx-key */
import React, { useRef, useEffect, useReducer, useContext, useMemo, memo, useCallback } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useTable, usePagination } from 'react-table';
import cns from 'classnames';

import { SvgIcon } from '@ui';
import { CartStoreContext, CatalogStoreContext } from '@store';
import { updateQueryParams } from '@helpers';

import StickyHead from './StickyHead';
import styles from './CatalogTable.module.scss';

const TableBody = observer(({ page, prepareRow, handleAddToCartClick, ...props }) => {
  const { cartItemIds } = useContext(CartStoreContext);
  const { getCategoryByName } = useContext(CatalogStoreContext);

  const getCategoryId = (cat_name) => {
    return getCategoryByName(cat_name).id;
  };

  const handleCategoryClick = (cat_name, e) => {
    e & e.preventDefault();
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

  return (
    <tbody {...props}>
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
            <td colSpan="6" className={styles.groupTableHeader}>
              <a href={`?category=${getCategoryId(category)}`} onClick={(e) => handleCategoryClick(category, e)}>
                {category}
              </a>
            </td>
          );
        }

        return (
          <tr
            {...row.getRowProps()}
            key={row.cells[row.cells.length - 1].value}
            onClick={() => !groupingHeader && handleAddToCartClick(row.cells[row.cells.length - 1].value)}>
            {/* {groupingHeader && groupingHeader} */}

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
        );
      })}
    </tbody>
  );
});

export default memo(TableBody);
