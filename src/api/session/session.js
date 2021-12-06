import { api, endpoints } from '@api';

export default {
  create: async () => {
    return api.post(endpoints.session.create);
  },
  alive: async (req) => {
    /**
      @sessionId string
      @cartId string
    */
    return api.post(endpoints.session.alive, req);
  },
  addParams: async (req) => {
    // @sessionId string
    // @params object (key: string)
    return api.post(endpoints.session.addParams, req);
  },
  logCatalog: async (req) => {
    /** 
      @sessionId string
      @eventId string
      @searchTerm string
      @categoryId string

      @filterSize Array[string]
      @filterMark Array[string]
      @filterLength Array[string]
      @productsCount Number
    */
    return api.post(endpoints.log.addCatalogState, {
      ...req,
    });
  },
  logEvent: async (req) => {
    /** 
      @sessionId string
      @eventId string
      @eventName string
      @params Object (key: string)
    */
    return api.post(endpoints.log.addEvent, {
      ...req,
    });
  },
};
