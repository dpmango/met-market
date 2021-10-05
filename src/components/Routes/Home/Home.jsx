import React, { useContext, useEffect } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

import { useQuery } from '@hooks';
// import { CatalogStoreContext, SessionStoreContext } from '@store';

import { CatalogCategories, CatalogTable } from '@c/Catalog';
import { AddToCart } from '@c/Cart';
import { CallbackHero } from '@c/Callback';

const HomePage = observer(() => {
  const query = useQuery();
  const categoryQuery = query.get('category');
  const searchQuery = query.get('search');

  return (
    <>
      {!searchQuery && !categoryQuery && <CallbackHero />}

      <div className="container">
        <CatalogCategories />
        <CatalogTable />
      </div>

      <AddToCart />

      <Helmet>
        <title>Главная</title>
      </Helmet>
    </>
  );
});

export default HomePage;
