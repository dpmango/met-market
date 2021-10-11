import React, { useContext, Profiler, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

// import { CatalogStoreContext, SessionStoreContext } from '@store';
// import { ProfilerLog } from '@helpers';
import { useQuery } from '@hooks';
import { UiStoreContext } from '@store';

import { CatalogCategories, CatalogTable } from '@c/Catalog';
import { AddToCart } from '@c/Cart';
import { CallbackHero } from '@c/Callback';

const HomePage = observer(() => {
  const query = useQuery();
  const uiContext = useContext(UiStoreContext);

  useEffect(() => {
    uiContext.updateParams(query);
  }, [query]);

  return (
    <>
      <Helmet>
        <title>Металлопрокат оптом и в розницу в Москве</title>
      </Helmet>

      <CallbackHero />

      <div className="container">
        <CatalogCategories />
        <CatalogTable />
      </div>

      <AddToCart />
    </>
  );
});

export default HomePage;
