import React, { useContext, Profiler, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

import { useQuery } from '@hooks';
import { UiStoreContext, SessionStoreContext } from '@store';

import { CatalogCategories, CatalogTable } from '@c/Catalog';
import { AddToCart } from '@c/Cart';
import { CallbackHero } from '@c/Callback';

const HomePage = observer(() => {
  const query = useQuery();

  const uiContext = useContext(UiStoreContext);
  const sessionContext = useContext(SessionStoreContext);

  // update queryParams and send UTM marks
  useEffect(() => {
    if (sessionContext.sessionId) {
      uiContext.updateParams(query);
      sessionContext.sendUtmParams(window.location);
    }
  }, [query, sessionContext.sessionId]);

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
