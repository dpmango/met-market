/* eslint-disable react/jsx-key */
import React, { useMemo, useState, useContext, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { Link, NavLink, useHistory, useLocation } from 'react-router-dom';
import cns from 'classnames';

import { SvgIcon, SelectFilter } from '@ui';
import { UiStoreContext, CatalogStoreContext } from '@store';
import { useOnClickOutside } from '@hooks';

import styles from './StickyHead.module.scss';

const StickyHead = observer(({ headerGroups, categoryData }) => {
  const headRef = useRef(null);
  const { query } = useContext(UiStoreContext);

  const [opened, setOpened] = useState(false);

  const {
    catalogOpened,
    header: { scrolledSticky },
  } = useContext(UiStoreContext);
  const { filters } = useContext(CatalogStoreContext);

  const handleThClick = useCallback(
    (id) => {
      if (['size', 'mark', 'length'].includes(id)) {
        if (opened === id) {
          setOpened(false);
        } else {
          setOpened(id);
        }
      }
    },
    [opened]
  );

  useOnClickOutside(
    headRef,
    useCallback((e) => setOpened(false), [setOpened])
  );

  return (
    <thead className={cns(styles.stickyHead, scrolledSticky && !catalogOpened && styles._sticky)} ref={headRef}>
      {headerGroups.map((headerGroup) => (
        <tr {...headerGroup.getHeaderGroupProps()} className={styles.desktopHead}>
          {headerGroup.headers.map((column) => {
            return (
              <th
                {...column.getHeaderProps()}
                className={cns(
                  ['size', 'mark', 'length'].includes(column.id) && styles._clickable,
                  column.id === opened && styles._activeTH
                )}
                onClick={() => handleThClick(column.id)}>
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
                        setOpened={(v) => null}
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
                        setOpened={(v) => null}
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
                        setOpened={(v) => null}
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
