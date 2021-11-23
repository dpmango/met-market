import React, { useEffect, useContext, useCallback } from 'react';
import { observer } from 'mobx-react';
import { ToastProvider } from 'react-toast-notifications';
import { YMInitializer } from 'react-yandex-metrika';

import { Toast, Loader, LoaderContextProvider } from '@ui';
import { useEventListener } from '@hooks';
import { CartStoreContext, SessionStoreContext } from '@store';
import { EVENTLIST, logEvent } from '@helpers';
import { LOCAL_STORAGE_CART, LOCAL_STORAGE_SESSION } from '@config/localStorage';

import Routes from '@c/Routes';

const App = observer(() => {
  const cartContext = useContext(CartStoreContext);
  const sessionContext = useContext(SessionStoreContext);

  useEffect(() => {
    window.loadObserver && window.loadObserver.disconnect();

    logEvent({
      name: EVENTLIST.PAGELOAD,
      params: {
        url: window.location.href,
      },
    });
  }, []);

  const persistTabsStore = useCallback((e) => {
    if (e.key === LOCAL_STORAGE_CART) {
      cartContext.hydrateStore();
    } else if (e.key === LOCAL_STORAGE_SESSION) {
      sessionContext.hydrateStore();
    }
  }, []);

  const onYMLoaded = useCallback(() => {
    const ymId = window[`yaCounter${86522567}`].getClientID();

    sessionContext.addSessionParams({
      ymClientId: ymId,
    });
  }, []);

  useEventListener('storage', persistTabsStore);
  useEventListener(`yacounter${86522567}inited`, onYMLoaded, document);

  return (
    <>
      <ToastProvider autoDismiss={true} placement="top-center" autoDismissTimeout={10000} components={{ Toast: Toast }}>
        <Routes />
        <YMInitializer
          accounts={[86522567]}
          options={{
            defer: true,
            clickmap: true,
            trackLinks: true,
            accurateTrackBounce: true,
            webvisor: true,
            triggerEvent: true,
          }}
        />
      </ToastProvider>
    </>
  );
});

export default App;
