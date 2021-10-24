/* eslint-disable react/jsx-key */
import React, { useContext, memo } from 'react';
import { observer } from 'mobx-react';

import { SvgIcon } from '@ui';
import { CartStoreContext } from '@store';

import styles from './CatalogTable.module.scss';

const TableBody = observer(({ row, prepareRow, handleAddToCartClick }) => {
  const { cartItemIds } = useContext(CartStoreContext);

  prepareRow(row);

  return (
    <tr
      {...row.getRowProps()}
      rowSpan="2"
      key={row.cells[row.cells.length - 1].value}
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
  );
});

export default memo(TableBody);
