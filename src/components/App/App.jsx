import React from 'react';
import { ToastProvider } from 'react-toast-notifications';

import { Toast, Loader, LoaderContextProvider } from '@ui';
import Routes from '@c/Routes';

const App = () => {
  return (
    <>
      <ToastProvider autoDismiss={true} placement="top-center" autoDismissTimeout={10000} components={{ Toast: Toast }}>
        <LoaderContextProvider>
          <Routes />
          <Loader />
        </LoaderContextProvider>
      </ToastProvider>
    </>
  );
};

export default App;
