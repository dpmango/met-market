/* eslint-disable react/jsx-key */
import React, { useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { CatalogStoreContext } from '@store';

import CategoryMain from './CategoryMain';
import styles from './CatalogMenu.module.scss';

const CatalogMenu = observer(({ abcOrder, className }) => {
  const { categoriesList, categoriesAbc } = useContext(CatalogStoreContext);

  const list = useMemo(() => {
    if (abcOrder) {
      return categoriesAbc;
    }
    return categoriesList;
  }, [categoriesList, categoriesAbc, abcOrder]);

  return (
    <div className={cns(styles.catalog, className)}>
      {abcOrder && (
        <div className={styles.letters}>
          {Object.keys(list).map((letter) => (
            <div className={styles.letter}>{letter}</div>
          ))}
        </div>
      )}

      <>
        {list && list.length > 0 && (
          <div className="row">
            <div className="col col-4 col-md-12">
              {list.slice(0, 2).map((cat) => (
                <CategoryMain key={cat.id} category={cat} />
              ))}
            </div>
            <div className="col col-4 col-md-12">
              {list.slice(2, 5).map((cat) => (
                <CategoryMain key={cat.id} category={cat} />
              ))}
            </div>
            <div className="col col-4 col-md-12">
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
