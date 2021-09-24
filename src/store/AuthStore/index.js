import React from 'react';

import AuthStore from './AuthStore';

const auth = new AuthStore();
const AuthStoreContext = React.createContext(auth);

export { auth, AuthStoreContext };
