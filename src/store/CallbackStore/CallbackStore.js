import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { session } from '@store';
import service from './api-service';

export default class SessionStore {
  constructor() {
    makeAutoObservable(this);
  }

  async submitForm({ type, payload }) {
    const [err, data] = await service.submit({
      sessionId: session.sessionId,
      formType: type,
      fields: payload,
    });

    if (err) throw err;

    return data;
  }

  async typingForm({ type, payload }) {
    const [err, data] = await service.typing({
      sessionId: session.sessionId,
      formType: type,
      field: payload,
    });

    if (err) throw err;

    return data;
  }

  async uploadFiles(files, progress) {
    const [err, data] = await service.upload({
      sessionId: session.sessionId,
      files: files,
      progress,
    });

    if (err) throw err;

    return data;
  }
}
