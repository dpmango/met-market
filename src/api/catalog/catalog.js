import { api, endpoints } from '@api';
import mockData from './mockData.json';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

export default {
  get: (lastDate) => {
    let params = {};
    if (lastDate) {
      params = {
        headers: {
          'If-Modified-Since': dayjs.utc(lastDate).format('ddd, DD MMM YYYY HH:mm:ss') + ' GMT',
        },
      };
    }

    return api.get(endpoints.catalog.export, params);
    // return mockData;
  },
};
