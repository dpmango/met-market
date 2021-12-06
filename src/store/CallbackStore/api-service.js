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

  async upload({ sessionId, files, progress }) {
    try {
      let uploading = files;
      if (!Array.isArray(uploading)) {
        uploading = [files];
      }

      const fileUploads = uploading.map(
        (file, i) =>
          new Promise((resolve, reject) => {
            fileApi
              .upload({ sessionId, file, progress })
              .then(({ data }) => resolve(data))
              .catch((err) => reject(err));
          })
      );

      let returnable = [];

      const promises = await Promise.all(fileUploads)
        .then((values) => {
          returnable = values;
        })
        .catch((err) => {
          throw err;
        });

      return [null, returnable];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }

  async delete(req) {
    try {
      const { data } = await fileApi.delete(req);

      return [null, data];
    } catch (error) {
      this.handleError(error);

      return [error, null];
    }
  }
}

export default new CallbackService();
