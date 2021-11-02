import React, { useEffect } from 'react';
import { ToastProvider } from 'react-toast-notifications';

import { Toast, Loader, LoaderContextProvider } from '@ui';
import Routes from '@c/Routes';

const App = () => {
  useEffect(() => {
    window.loadObserver && window.loadObserver.disconnect();
  }, []);

  return (
    <>
      <ToastProvider autoDismiss={true} placement="top-center" autoDismissTimeout={10000} components={{ Toast: Toast }}>
        <Routes />
      </ToastProvider>
    </>
  );
};

export default App;
