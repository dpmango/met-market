/* eslint-disable react/jsx-key */
import React, { useMemo, useState, useContext, memo } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Link, NavLink, useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { SvgIcon, SelectFilter } from '@ui';
import { UiStoreContext, CatalogStoreContext } from '@store';

import styles from './StickyHead.module.scss';

const StickyHead = observer(({ headerGroups, categoryData }) => {
  const { query } = useContext(UiStoreContext);

  const [opened, setOpened] = useState(false);

  const {
    catalogOpened,
    header: { scrolledSticky },
  } = useContext(UiStoreContext);
  const { filters } = useContext(CatalogStoreContext);

  return (
    <thead className={cns(styles.stickyHead, scrolledSticky && !catalogOpened && styles._sticky)}>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()} className={styles.desktopHead}>
          {headerGroup.headers.map((column) => {
            return (
              <th {...column.getHeaderProps()} className={column.id === opened && styles._activeTH}>
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
                        opened={opened === 'size'}
                        setOpened={(v) => setOpened(v ? 'size' : false)}
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
                        opened={opened === 'mark'}
                        setOpened={(v) => setOpened(v ? 'mark' : false)}
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
                        opened={opened === 'length'}
                        setOpened={(v) => setOpened(v ? 'length' : false)}
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

export default StickyHead;
