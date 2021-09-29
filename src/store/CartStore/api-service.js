import { ApiService } from '@services';
import api from '@api/cart';

class CartService extends ApiService {
  async get(req) {
    try {
      const { data } = await api.get(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async add(req) {
    try {
      const { data } = await api.add(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async update(req) {
    try {
      const { data } = await api.update(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async remove(req) {
    try {
      const { data } = await api.remove(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async submit(req) {
    try {
      const { data } = await api.submit(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new CartService();
