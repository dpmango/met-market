import React, { useEffect, useContext, useCallback } from 'react';
import { observer } from 'mobx-react';
import { ToastProvider } from 'react-toast-notifications';

import { Toast, Loader, LoaderContextProvider } from '@ui';
import { useEventListener } from '@hooks';
import { CartStoreContext, SessionStoreContext } from '@store';
import { initTrackers, EVENTLIST, logEvent } from '@helpers';
import { LOCAL_STORAGE_CART, LOCAL_STORAGE_SESSION, LOCAL_STORAGE_YM } from '@config/localStorage';

import Routes from '@c/Routes';

const ymCounterId = 86522567;

const App = observer(() => {
  const cartContext = useContext(CartStoreContext);
  const sessionContext = useContext(SessionStoreContext);
  const { sessionNumber } = useContext(SessionStoreContext);

  useEffect(() => {
    window.loadObserver && window.loadObserver.disconnect();

    initTrackers();
  }, []);

  const persistTabsStore = useCallback((e) => {
    if (e.key === LOCAL_STORAGE_CART) {
      cartContext.hydrateStore();
    } else if (e.key === LOCAL_STORAGE_SESSION) {
      sessionContext.hydrateStore();
    }
  }, []);

  const onYMLoaded = useCallback(() => {
    const ymId = window[`yaCounter${ymCounterId}`].getClientID();
    var ymTagSend = JSON.parse(localStorage.getItem(LOCAL_STORAGE_YM));

    window.ym(ymCounterId, 'userParams', {
      session_number: sessionNumber,
      UserID: sessionNumber,
    });

    if (ymTagSend !== ymId) {
      sessionContext.addSessionParams({
        ymClientId: ymId,
        ymCounterId: `${ymCounterId}`,
      });

      localStorage.setItem(LOCAL_STORAGE_YM, JSON.stringify(ymId));
    }
  }, [sessionNumber]);

  useEventListener('storage', persistTabsStore);
  useEventListener(`yacounter${ymCounterId}inited`, onYMLoaded, document);

  return (
    <>
      <ToastProvider autoDismiss={true} placement="top-center" autoDismissTimeout={10000} components={{ Toast: Toast }}>
        <Routes />
      </ToastProvider>
    </>
  );
});

export default App;
