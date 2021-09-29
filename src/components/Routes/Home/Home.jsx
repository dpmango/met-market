import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

import { CatalogStoreContext, SessionStoreContext } from '@store';
import { CatalogCategories, CatalogTable } from '@c/Catalog';

const HomePage = observer(() => {
  const catalog = useContext(CatalogStoreContext);
  const session = useContext(SessionStoreContext);

  useEffect(async () => {
    await catalog.getCatalog();
    // await session.createSession();
  }, []);

  return (
    <>
      <div className="container">
        <CatalogCategories />
        <CatalogTable />
      </div>

      <Helmet>
        <title>Главная</title>
      </Helmet>
    </>
  );
});

export default HomePage;
