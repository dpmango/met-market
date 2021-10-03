/* eslint-disable react/jsx-key */
import React, { memo, useCallback, useContext } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { Button, Select, SelectFilter, Spinner, SvgIcon } from '@ui';
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
        isPopular: option.isPopular,
      }));
  };

  return data ? (
    <div className={styles.filters}>
      <div className={styles.filterImage}>
        <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/8/8c/Walt_Disney_Concert_Hall%2C_LA%2C_CA%2C_jjron_22.03.2012.jpg/2880px-Walt_Disney_Concert_Hall%2C_LA%2C_CA%2C_jjron_22.03.2012.jpg" />
      </div>
      <div className={styles.filterContent}>
        <div className={cns('row', styles.filterContentRow)}>
          <div className="col col-3">
            {data.size && (
              <SelectFilter label="Размер" name="size" value={filters.size} options={createOpitons(data.size)} />
            )}
          </div>
          <div className="col col-3">
            {data.mark && (
              <SelectFilter label="Марка" name="mark" value={filters.mark} options={createOpitonsMark(data.mark)} />
            )}
          </div>
          <div className="col col-3">
            {data.length && (
              <SelectFilter label="Длина" name="length" value={filters.length} options={createOpitons(data.length)} />
            )}
          </div>
          <div className="col col-3">
            <Button
              outline={true}
              onClick={(v) => {
                catalogContext.resetFilters();
              }}>
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
