import { api, endpoints } from '@api';
import mockData from './mockData.json';

export default {
  get: (req) => {
    return api.get(endpoints.catalog.export);
    // return mockData;
  },
};
