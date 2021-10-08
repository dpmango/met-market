export default {
  catalog: {
    export: 'data/export-collapsed-flat.json',
  },
  session: {
    create: 'api/session/create',
    alive: 'api/session/alive',
  },
  cart: {
    getItems: 'api/cart/getItems',
    addItem: 'api/cart/addItem',
    updateItem: 'api/cart/updateItem',
    removeItem: 'api/cart/removeItem',
    submit: 'api/cart/submit',
  },
  form: {
    submit: 'api/form/submit',
    typing: 'api/form/typing',
  },
  log: {
    addSearchTerm: 'api/log/addSearchTerm',
  },
};
