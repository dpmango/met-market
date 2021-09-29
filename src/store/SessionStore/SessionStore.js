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

  // actions
  async init() {
    if (localStorage.getItem('metMarketSession')) {
      const lsObj = JSON.parse(localStorage.getItem('metMarketSession'));
      const { sessionId, cartId, cartNumber } = lsObj;

      this.sessionId = sessionId;
      this.cartId = cartId;
      this.cartNumber = cartNumber;

      try {
        await this.aliveSession({ sessionId, cartId });
      } catch (e) {
        console.log('CORS?');
      }

      await cart.getCart({ cartId });
    } else {
      localStorage.clear();
      await this.createSession();
    }
  }

  async createSession() {
    const [err, data] = await service.create();

    if (err) throw err;

    const { sessionId, cartId, cartNumber } = data;

    runInAction(() => {
      this.sessionId = sessionId;
      this.cartId = cartId;
      this.cartNumber = cartNumber;

      localStorage.setItem('metMarketSession', JSON.stringify(data));
    });

    return data;
  }

  async aliveSession(req) {
    const [err, result] = await service.alive(req);

    if (err) throw err;

    return result;
  }
}
