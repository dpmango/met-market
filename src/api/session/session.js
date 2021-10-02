import { api, endpoints } from '@api';

export default {
  create: async (req) => {
    return api.post(endpoints.session.create);
  },
  alive: async (req) => {
    // @sessionId string
    // @cartId string
    return api.post(endpoints.session.alive, null, { params: { ...req } });
  },
  log: async (req) => {
    /** 
      @sessionId string
      @searchTerm string
      @categoryId string
    */
    return api.post(endpoints.log.addSearchTerm, null, { params: { ...req } });
  },
};
