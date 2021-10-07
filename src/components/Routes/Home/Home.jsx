import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

// import { CatalogStoreContext, SessionStoreContext } from '@store';

import { CatalogCategories, CatalogTable } from '@c/Catalog';
import { AddToCart } from '@c/Cart';
import { CallbackHero } from '@c/Callback';

const HomePage = observer(() => {
  return (
    <>
      <CallbackHero />

      <div className="container">
        <CatalogCategories />
        <CatalogTable />
      </div>

      <AddToCart />

      <Helmet>
        <title> Металлопрокат оптом и в розницу в Москве</title>
      </Helmet>
    </>
  );
});

export default HomePage;
