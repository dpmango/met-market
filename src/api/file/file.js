import { api, endpoints } from '@api';

function readBynary(file) {
  return new Promise((resolve, reject) => {
    let reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = reject;

    reader.readAsBinaryString(file);
  });
}

export default {
  upload: async (req) => {
    // @sessionId string
    // @file binary blob

    const formData = new FormData();

    Object.keys(req).forEach((key) => {
      if (['progress'].includes(key)) return;

      formData.append(key, req[key]);
    });

    // let arrayBuffer = await readBynary(req.file);

    return api.post(endpoints.file.upload, formData, {
      timeout: 120 * 1000,
      onUploadProgress: (e) => {
        console.log('progress', e);
        const percentCompleted = Math.round((e.loaded * 100) / e.total);
        req.progress && req.progress(percentCompleted);
      },
    });
  },
};
