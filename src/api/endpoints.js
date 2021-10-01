export default {
  catalog: {
    // export: 'catalog/export-collapsed-flat.json',
  },
  session: {
    create: '/session/create',
    alive: '/session/alive',
  },
  cart: {
    getItems: '/cart/getItems',
    addItem: '/cart/addItem',
    updateItem: '/cart/updateItem',
    removeItem: '/cart/removeItem',
    submit: '/cart/submit',
  },
  form: {
    submit: '/form/submit',
    typing: '/form/typing',
  },
  log: {
    addSearchTerm: '/log/addSearchTerm',
  },
};
