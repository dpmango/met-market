import React from 'react';

import CartStore from './CartStore';

const cart = new CartStore();
const CartStoreContext = React.createContext(cart);

export { cart, CartStoreContext };
