import React from 'react';

import UiStore from './UiStore';

const ui = new UiStore();
const UiStoreContext = React.createContext(ui);

export { ui, UiStoreContext };
