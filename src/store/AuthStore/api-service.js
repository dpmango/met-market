import { ApiService } from '@services';
import api from '@api/auth';

class AuthService extends ApiService {
  async auth({ email, password }) {
    try {
      const { data } = await api.login({ email, password });

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new AuthService();
