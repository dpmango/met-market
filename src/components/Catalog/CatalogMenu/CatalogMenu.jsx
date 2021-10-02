/* eslint-disable react/jsx-key */
import React, { useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import CategoryMain from './CategoryMain';
import styles from './CatalogMenu.module.scss';

const CatalogMenu = observer(({ list, className }) => {
  return (
    <div className={cns(styles.catalog, className)}>
      <>
        {list && list.length > 0 && (
          <div className="row">
            <div className="col col-4">
              {list.slice(0, 2).map((cat) => (
                <CategoryMain key={cat.id} category={cat} />
              ))}
            </div>
            <div className="col col-4">
              {list.slice(2, 5).map((cat) => (
                <CategoryMain key={cat.id} category={cat} />
              ))}
            </div>
            <div className="col col-4">
              {list.slice(5, 7).map((cat) => (
                <CategoryMain key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        )}
      </>
    </div>
  );
});

export default CatalogMenu;
