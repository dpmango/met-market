/* eslint-disable react/jsx-key */
import React, { useMemo, useContext, useCallback, useRef, useState, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Button, SvgIcon, SelectFilter } from '@ui';
import { UiStoreContext, CatalogStoreContext } from '@store';
import { useOnClickOutside } from '@hooks';

import styles from './MobileFilter.module.scss';

const MobileFilter = observer(({ categoryData }) => {
  const location = useLocation();
  const history = useHistory();

  const mobRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const { filters, someFiltersActive } = useContext(CatalogStoreContext);

  const {
    catalogOpened,
    header: { scrolledSticky },
  } = useContext(UiStoreContext);

  const resetFilters = useCallback(
    (e) => {
      e && e.preventDefault();

      updateQueryParams({
        history,
        location,
        payload: {
          type: 'filter',
          value: {
            size: null,
            length: null,
            mark: null,
          },
        },
      });
    },
    [history, location]
  );

  useOnClickOutside(
    mobRef,
    useCallback((e) => setVisible(false), [setVisible])
  );

  return (
    <div
      className={cns(styles.mobFilter, scrolledSticky && !catalogOpened && styles._sticky, visible && styles._active)}
      ref={mobRef}>
      <div className={cns(styles.mobFilterToggle)} onClick={() => setVisible(!visible)}>
        <SvgIcon name="filters" />
        <span>Фильтры</span>
        <div className={styles.mobFilterIcon}>
          <SvgIcon name="caret" />
        </div>
      </div>
      <div className={styles.mobFilterSubtitle}>Цена с НДС</div>

      {categoryData && (
        <div className={cns(styles.filters, visible && styles._visible)}>
          <SelectFilter
            inline
            optionsClassName={cns(styles.selectOptions, styles.size)}
            label="Размер"
            name="size"
            value={filters.size}
            options={categoryData.filters.size}
          />
          <SelectFilter
            inline
            optionsClassName={cns(styles.selectOptions, styles.mark)}
            label="Марка"
            name="mark"
            value={filters.mark}
            options={categoryData.filters.mark}
          />
          <SelectFilter
            inline
            optionsClassName={cns(styles.selectOptions, styles.length)}
            label="Длина"
            name="length"
            value={filters.length}
            options={categoryData.filters['length']}
          />
          <div className={styles.reset}>
            <Button outline={!someFiltersActive} disabled={!someFiltersActive} onClick={resetFilters}>
              Сбросить фильтры
            </Button>
          </div>
        </div>
      )}
    </div>
  );
});

export default memo(MobileFilter);
