import { getEnv } from '@helpers';

export default {
  catalog: {
    export: getEnv('GATEWAY_CATALOG_JSON'),
  },
  session: {
    create: 'api/session/create',
    alive: 'api/session/alive',
  },
  cart: {
    getItems: 'api/cart/getItems',
    new: 'api/cart/newCart',
    addItem: 'api/cart/addItem',
    updateItem: 'api/cart/updateItem',
    removeItem: 'api/cart/removeItem',
    submit: 'api/cart/submit',
  },
  form: {
    submit: 'api/form/submit',
    typing: 'api/form/typing',
  },
  file: {
    upload: 'api/file/upload',
  },
  log: {
    addSearchTerm: 'api/log/addSearchTerm',
  },
};
