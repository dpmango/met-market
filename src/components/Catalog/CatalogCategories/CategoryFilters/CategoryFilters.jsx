/* eslint-disable react/jsx-key */
import React, { memo, useCallback, useContext, useState, useEffect, useRef } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Button, SelectFilter, Spinner, LazyMedia } from '@ui';
import { CatalogStoreContext, UiStoreContext } from '@store';
import { useFirstRender, useOnClickOutside } from '@hooks';
import { updateQueryParams } from '@helpers';

import styles from './CategoryFilters.module.scss';

const CategoryFilters = observer(({ image, data }) => {
  const contentRef = useRef(null);
  const location = useLocation();
  const history = useHistory();

  const firstRender = useFirstRender();

  const { filters, someFiltersActive } = useContext(CatalogStoreContext);
  const { query } = useContext(UiStoreContext);
  const [opened, setOpened] = useState(false);

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

  useEffect(() => {
    if (!firstRender) {
      resetFilters();
    }
  }, [query.category]);

  useOnClickOutside(
    contentRef,
    useCallback((e) => setOpened(false), [setOpened])
  );

  return data ? (
    <div className={styles.filters}>
      <div className={styles.filterImage}>
        <LazyMedia src={image} width={240} height={100} />
      </div>
      <div className={styles.filterContent} ref={contentRef}>
        <div className={cns('row', styles.filterContentRow)}>
          <div className="col col-4">
            {data.size && (
              <SelectFilter
                label="Размер"
                name="size"
                value={filters.size}
                options={data.size}
                opened={opened === 'size'}
                setOpened={(v) => setOpened(v ? 'size' : false)}
              />
            )}
          </div>
          <div className="col col-4">
            {data.mark && (
              <SelectFilter
                label="Марка"
                name="mark"
                value={filters.mark}
                options={data.mark}
                opened={opened === 'mark'}
                setOpened={(v) => setOpened(v ? 'mark' : false)}
              />
            )}
          </div>
          <div className="col col-4">
            {data.length && (
              <SelectFilter
                label="Длина"
                name="length"
                value={filters.length}
                options={data.length}
                opened={opened === 'length'}
                setOpened={(v) => setOpened(v ? 'length' : false)}
              />
            )}
          </div>
        </div>
        <div className={styles.filterCta}>
          <Button outline={true} disabled={!someFiltersActive} onClick={resetFilters}>
            Сбросить фильтры
          </Button>
        </div>
      </div>
    </div>
  ) : (
    <Spinner />
  );
});

export default memo(CategoryFilters);
