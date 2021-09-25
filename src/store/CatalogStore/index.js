import React from 'react';

import CatalogStore from './CatalogStore';

const catalog = new CatalogStore();
const CatalogStoreContext = React.createContext(catalog);

export { catalog, CatalogStoreContext };
