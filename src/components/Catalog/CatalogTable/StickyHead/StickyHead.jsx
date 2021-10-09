/* eslint-disable react/jsx-key */
import React, { useMemo, useContext, memo } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Link, NavLink, useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { SvgIcon, SelectFilter } from '@ui';
import { UiStoreContext, CatalogStoreContext } from '@store';
import { useQuery } from '@hooks';

import styles from './StickyHead.module.scss';

const StickyHead = observer(({ headerGroups }) => {
  const query = useQuery();
  const category = query.get('category');
  const sizeFilter = query.get('size');
  const markFilter = query.get('mark');
  const lengthFilter = query.get('length');

  const {
    catalogOpened,
    header: { scrolledSticky },
  } = useContext(UiStoreContext);
  const { filters, getCategoryFilters } = useContext(CatalogStoreContext);

  // getters
  const categoryData = useMemo(() => {
    if (category) {
      return getCategoryFilters(category);
    }

    return null;
  }, [category, sizeFilter, markFilter, lengthFilter]);

  return (
    <thead className={cns(styles.stickyHead, scrolledSticky && !catalogOpened && styles._sticky)}>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()}>
          {headerGroup.headers.map((column) => {
            return (
              <th {...column.getHeaderProps()}>
                <div className={styles.cell}>
                  <span>{column.render('Header')}</span>
                  {categoryData && column.id === 'size' && (
                    <div className={styles.cellFilter}>
                      <SelectFilter
                        mini
                        optionsClassName={cns(styles.selectOptions, styles.size)}
                        label="Размер"
                        name="size"
                        value={filters.size}
                        options={categoryData.filters.size}
                      />
                    </div>
                  )}
                  {categoryData && column.id === 'mark' && (
                    <div className={styles.cellFilter}>
                      <SelectFilter
                        mini
                        optionsClassName={cns(styles.selectOptions, styles.mark)}
                        label="Марка"
                        name="mark"
                        value={filters.mark}
                        options={categoryData.filters.mark}
                      />
                    </div>
                  )}
                  {categoryData && column.id === 'length' && (
                    <div className={styles.cellFilter}>
                      <SelectFilter
                        mini
                        optionsClassName={cns(styles.selectOptions, styles.length)}
                        label="Длина"
                        name="length"
                        value={filters.length}
                        options={categoryData.filters['length']}
                      />
                    </div>
                  )}
                </div>
              </th>
            );
          })}
        </tr>
      ))}
    </thead>
  );
});

export default memo(StickyHead);
