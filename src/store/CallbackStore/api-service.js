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
      const fileUploads = files.map(
        (file, i) =>
          new Promise((resolve, reject) => {
            fileApi
              .upload({ sessionId, file })
              .then(({ data }) => resolve(data))
              .catch((err) => reject(err));
          })
      );

      const promises = await Promise.all(fileUploads).then((values) => {
        return [null, values];
      });

      return promises;
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new CallbackService();
