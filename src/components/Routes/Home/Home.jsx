import React, { useContext } from 'react';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';

import { AuthStoreContext } from '@store';

const HomePage = observer(() => {
  const { userEmail } = useContext(AuthStoreContext);

  return (
    <>
      <div className="container">
        <div className="h1-title">Hey there {userEmail}!</div>
      </div>
      <Helmet>
        <title>Homepage</title>
      </Helmet>
    </>
  );
});

export default HomePage;
