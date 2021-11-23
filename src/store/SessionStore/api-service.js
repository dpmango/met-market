import { ApiService } from '@services';
import api from '@api/session';

class SessionService extends ApiService {
  async create() {
    try {
      const { data } = await api.create();

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async alive(req) {
    try {
      const { data } = await api.alive(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async addParams(req) {
    try {
      const { data } = await api.addParams(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  // logs
  async logCatalog(req) {
    try {
      const { data } = await api.logCatalog(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async logEvent(req) {
    try {
      const { data } = await api.logEvent(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new SessionService();
