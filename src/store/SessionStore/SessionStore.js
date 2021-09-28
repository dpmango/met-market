import { makeAutoObservable, runInAction } from 'mobx';
// import { computedFn } from 'mobx-utils';

import service from './api-service';

export default class SessionStore {
  sessionId = null;
  cartId = null;
  cartNumber = null;

  constructor() {
    makeAutoObservable(this);
  }

  // actions
  async createSession() {
    const [err, data] = await service.create();

    if (err) throw err;

    const { sessionId, cartId, cartNumber } = data;

    runInAction(() => {
      this.sessionId = sessionId;
      this.cartId = cartId;
      this.cartNumber = cartNumber;
    });

    return result;
  }

  async aliveSession(req) {
    const [err, result] = await service.alive(req);

    if (err) throw err;

    // runInAction(() => {
    //   this.session = result;
    // });

    return result;
  }
}
