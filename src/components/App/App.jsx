import React, { useEffect, useContext, useCallback } from 'react';
import { observer } from 'mobx-react';
import { ToastProvider } from 'react-toast-notifications';
import { YMInitializer } from 'react-yandex-metrika';
import ReactGA from 'react-ga';

import { Toast, Loader, LoaderContextProvider } from '@ui';
import { useEventListener } from '@hooks';
import { CartStoreContext, SessionStoreContext } from '@store';
import { LOCAL_STORAGE_CART, LOCAL_STORAGE_SESSION } from '@config/localStorage';

import Routes from '@c/Routes';

const App = observer(() => {
  const cartContext = useContext(CartStoreContext);
  const sessionContext = useContext(SessionStoreContext);

  useEffect(() => {
    // console.log('should disconnect loadOBserver?');
    window.loadObserver && window.loadObserver.disconnect();

    ReactGA.initialize([
      {
        trackingId: 'UA-213145548-1',
        // gaOptions: {},
      },
      {
        trackingId: 'G-JTR149BB93',
        gaOptions: { name: 'GA4' },
      },
    ]);
  }, []);

  const persistTabsStore = useCallback((e) => {
    if (e.key === LOCAL_STORAGE_CART) {
      cartContext.hydrateStore();
    } else if (e.key === LOCAL_STORAGE_SESSION) {
      sessionContext.hydrateStore();
    }
  }, []);

  useEventListener('storage', persistTabsStore);

  return (
    <>
      <ToastProvider autoDismiss={true} placement="top-center" autoDismissTimeout={10000} components={{ Toast: Toast }}>
        <Routes />
        <YMInitializer
          accounts={[86522567]}
          options={{ defer: true, clickmap: true, trackLinks: true, accurateTrackBounce: true, webvisor: true }}
        />
      </ToastProvider>
    </>
  );
});

export default App;
