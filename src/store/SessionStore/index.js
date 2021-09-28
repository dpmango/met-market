import React from 'react';

import SessionStore from './SessionStore';

const session = new SessionStore();
const SessionStoreContext = React.createContext(session);

export { session, SessionStoreContext };
