/* eslint-disable react/jsx-key */
import React, { memo, useCallback, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Button, SelectFilter, Spinner, LazyMedia } from '@ui';
import { CatalogStoreContext } from '@store';
import { useQuery, useFirstRender } from '@hooks';
import { updateQueryParams } from '@helpers';

import styles from './CategoryFilters.module.scss';

const CategoryFilters = observer(({ image, data }) => {
  const query = useQuery();
  const location = useLocation();
  const history = useHistory();
  const categoryQuery = query.get('category');
  const firstRender = useFirstRender();

  const { filters, someFiltersActive } = useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);

  const resetFilters = (e) => {
    e && e.preventDefault();

    // catalogContext.resetFilters();
    updateQueryParams({
      history,
      location,
      query,
      payload: {
        type: 'filter',
        value: {
          size: null,
          length: null,
          mark: null,
        },
      },
    });
  };

  useEffect(() => {
    if (!firstRender) {
      console.log('reset filters because of category change');
      resetFilters();
    }
  }, [categoryQuery]);

  return data ? (
    <div className={styles.filters}>
      <div className={styles.filterImage}>
        <LazyMedia src={image} width={240} height={100} />
      </div>
      <div className={styles.filterContent}>
        <div className={cns('row', styles.filterContentRow)}>
          <div className="col col-4">
            {data.size && <SelectFilter label="Размер" name="size" value={filters.size} options={data.size} />}
          </div>
          <div className="col col-4">
            {data.mark && <SelectFilter label="Марка" name="mark" value={filters.mark} options={data.mark} />}
          </div>
          <div className="col col-4">
            {data.length && <SelectFilter label="Длина" name="length" value={filters.length} options={data.length} />}
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
