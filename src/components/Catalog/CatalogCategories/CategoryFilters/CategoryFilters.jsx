/* eslint-disable react/jsx-key */
import React, { memo, useCallback, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Button, Select, Spinner } from '@ui';
import { CatalogStoreContext } from '@store';
import { useQuery } from '@hooks';

import styles from './CategoryFilters.module.scss';

const CategoryFilters = observer(({ data }) => {
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();
  const { filters } = useContext(CatalogStoreContext);
  const catalogContext = useContext(CatalogStoreContext);

  const createOpitons = (options) => {
    return options
      .filter((x) => x)
      .map((option) => ({
        value: option,
        label: option,
      }));
  };

  const createOpitonsMark = (options) => {
    return options
      .filter((x) => x.name)
      .map((option) => ({
        value: option.name,
        label: option.name,
      }));
  };

  return data ? (
    <div className={styles.filters}>
      <div className={styles.filterImage}>
        <img src="img/categoryPlaceholder.png" />
      </div>
      <div className={styles.filterContent}>
        <div className={cns('row', styles.filterContentRow)}>
          <div className="col col-3">
            {data.size && (
              <Select
                isMulti
                value={filters.size}
                options={createOpitons(data.size)}
                onChange={(v) => catalogContext.setFilters(v, 'size')}
                placeholder="Размеры"
              />
            )}
          </div>
          <div className="col col-3">
            {data.mark && (
              <Select
                isMulti
                value={filters.mark}
                options={createOpitonsMark(data.mark)}
                onChange={(v) => catalogContext.setFilters(v, 'mark')}
                placeholder="Марка"
              />
            )}
          </div>
          <div className="col col-3">
            {data.length && (
              <Select
                isMulti
                value={filters.length}
                options={createOpitons(data.length)}
                onChange={(v) => catalogContext.setFilters(v, 'length')}
                placeholder="Длина"
              />
            )}
          </div>
          <div className="col col-3">
            <Button outline={true}>Сбросить фильтры</Button>
          </div>
        </div>
      </div>
    </div>
  ) : (
    <Spinner />
  );
});

export default memo(CategoryFilters);
