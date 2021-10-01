import { makeAutoObservable, runInAction } from 'mobx';
// import { computedFn } from 'mobx-utils';

import { cart } from '@store';
import service from './api-service';

export default class SessionStore {
  sessionId = null;
  cartId = null;
  cartNumber = null;

  constructor() {
    makeAutoObservable(this);

    this.init();
  }

  // inner actions
  setSession(newSession) {
    const { sessionId, cartId, cartNumber } = newSession;

    runInAction(() => {
      this.sessionId = sessionId;
      this.cartId = cartId;
      this.cartNumber = cartNumber;

      localStorage.setItem('metMarketSession', JSON.stringify(newSession));
    });
  }

  // api actions
  async init() {
    if (localStorage.getItem('metMarketSession')) {
      const lsObj = JSON.parse(localStorage.getItem('metMarketSession'));
      const { sessionId, cartId, cartNumber } = lsObj;

      try {
        await this.aliveSession({ sessionId, cartId });
        await cart.getCart({ cartId });
      } catch {
        await this.createSession();
      }

      this.sessionId = sessionId;
      this.cartId = cartId;
      this.cartNumber = cartNumber;
    } else {
      await this.createSession();
    }
  }

  async createSession() {
    localStorage.clear();
    const [err, data] = await service.create();

    if (err) throw err;

    const { sessionId, cartId, cartNumber } = data;

    this.setSession({ sessionId, cartId, cartNumber });

    await cart.getCart({ cartId });

    return data;
  }

  async aliveSession(req) {
    const [err, result] = await service.alive(req);

    if (err) throw err;

    return result;
  }
}
