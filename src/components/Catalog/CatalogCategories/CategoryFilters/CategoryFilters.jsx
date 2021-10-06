/* eslint-disable react/jsx-key */
import React, { memo, useCallback, useContext, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Button, SelectFilter, Spinner } from '@ui';
import { CatalogStoreContext } from '@store';
import { useQuery } from '@hooks';
import { updateQueryParams } from '@helpers';

import styles from './CategoryFilters.module.scss';

const CategoryFilters = observer(({ image, data }) => {
  const query = useQuery();
  const location = useLocation();
  const history = useHistory();
  const { filters, someFiltersActive } = useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);

  const resetFilters = (e) => {
    e.preventDefault();

    catalogContext.resetFilters();
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

  return data ? (
    <div className={styles.filters}>
      <div className={styles.filterImage}>
        <img src={image} />
      </div>
      <div className={styles.filterContent}>
        <div className={cns('row', styles.filterContentRow)}>
          <div className="col col-3">
            {data.size && <SelectFilter label="Размер" name="size" value={filters.size} options={data.size} />}
          </div>
          <div className="col col-3">
            {data.mark && <SelectFilter label="Марка" name="mark" value={filters.mark} options={data.mark} />}
          </div>
          <div className="col col-3">
            {data.length && <SelectFilter label="Длина" name="length" value={filters.length} options={data.length} />}
          </div>
          <div className="col col-3">
            <Button outline={true} disabled={!someFiltersActive} onClick={resetFilters}>
              Сбросить фильтры
            </Button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Spinner />
  );
});

export default memo(CategoryFilters);
