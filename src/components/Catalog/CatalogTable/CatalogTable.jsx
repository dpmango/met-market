import React, { useRef, useEffect, useReducer, useContext, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { CatalogStoreContext } from '@store/CatalogStore';

import styles from './CatalogTable.module.scss';

const CatalogTable = observer(() => {
  const history = useHistory();
  const { categories } = useContext(CatalogStoreContext);

  return (
    <div className="catalog mt-2 mb-2">
      <pre className="dev-log">{JSON.stringify(categories)}</pre>
      <h1>Каталог</h1>
    </div>
  );
});

export default CatalogTable;
