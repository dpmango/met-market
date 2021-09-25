import { ApiService } from '@services';
import api from '@api/catalog';

class CatalogService extends ApiService {
  async get() {
    try {
      const json = await api.get();

      return [null, json];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new CatalogService();
