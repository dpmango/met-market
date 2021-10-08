import { ApiService } from '@services';
import api from '@api/catalog';

class CatalogService extends ApiService {
  async get() {
    try {
      const { data, headers } = await api.get();

      return [
        null,
        {
          ...data,
          timestamp: headers['last-modified'],
        },
      ];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new CatalogService();
