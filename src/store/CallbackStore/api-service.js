import { ApiService } from '@services';
import api from '@api/callback';

class CallbackService extends ApiService {
  async submit(req) {
    try {
      const { data } = await api.submit(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async typing(req) {
    try {
      const { data } = await api.typing(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new CallbackService();
