import React from 'react';

import CallbackStore from './CallbackStore';

const callback = new CallbackStore();
const CallbackStoreContext = React.createContext(callback);

export { callback, CallbackStoreContext };
