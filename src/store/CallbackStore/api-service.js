import { ApiService } from '@services';
import api from '@api/callback';
import fileApi from '@api/file';

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

  async upload({ sessionId, files }) {
    try {
      let data = [];

      await files.forEach(async (file) => {
        const upload = await fileApi.upload({ sessionId, file });
        data = [...data, [upload]];
      });

      console.log('upload service data', data);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new CallbackService();
