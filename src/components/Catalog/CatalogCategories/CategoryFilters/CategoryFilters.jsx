/* eslint-disable react/jsx-key */
import React, { memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import Select from 'react-select';
import cns from 'classnames';

import { Button } from '@ui';
import { useQuery } from '@hooks';

import styles from './CategoryFilters.module.scss';

const CategoryFilters = ({ data }) => {
  const history = useHistory();
  const location = useLocation();
  const query = useQuery();

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
            {data.size && <Select options={createOpitons(data.size)} placeholder="Размеры" />}
          </div>
          <div className="col col-3">
            {data.mark && <Select options={createOpitonsMark(data.mark)} placeholder="Марка" />}
          </div>
          <div className="col col-3">
            {data.length && <Select options={createOpitons(data.length)} placeholder="Длина" />}
          </div>
          <div className="col col-3">
            <Button outline={true}>Сбросить фильтры</Button>
          </div>
        </div>
      </div>
    </div>
  ) : null;
};

export default memo(CategoryFilters);
