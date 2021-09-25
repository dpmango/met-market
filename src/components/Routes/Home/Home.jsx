import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

import { CatalogStoreContext } from '@store';
import { CatalogTable } from '@c/Catalog';

const HomePage = observer(() => {
  const catalog = useContext(CatalogStoreContext);

  useEffect(async () => {
    await catalog.getCatalog();
  }, []);

  return (
    <>
      <div className="container">
        <CatalogTable />
      </div>
      <Helmet>
        <title>Главная</title>
      </Helmet>
    </>
  );
});

export default HomePage;
