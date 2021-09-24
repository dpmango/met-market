import React from 'react';

import { Loader, LoaderContextProvider } from '@ui';
import Routes from '@components/Routes';

const App = () => {
  return (
    <>
      <LoaderContextProvider>
        <Routes />
        <Loader />
      </LoaderContextProvider>
    </>
  );
};

export default App;
