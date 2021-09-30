import { api, endpoints } from '@api';

export default {
  create: (req) => {
    return api.post(endpoints.session.create);
  },
  alive: (req) => {
    // @sessionId string
    // @cartId string
    return api.post(endpoints.session.alive, null, { params: { ...req } });
  },
};
