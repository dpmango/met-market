import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { cart } from '@store';
import { LOCAL_STORAGE_SESSION, LOCAL_STORAGE_LOG } from '@config/localStorage';
import service from './api-service';

export default class SessionStore {
  sessionId = null;
  cartId = null;
  cartNumber = null;
  log = {
    search: [],
    carts: [],
    orders: [],
  };

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

      localStorage.setItem(LOCAL_STORAGE_SESSION, JSON.stringify(newSession));
    });
  }

  async setLog({ type, payload }) {
    const request = {
      sessionId: this.sessionId,
      searchTerm: payload,
      categoryId: type,
    };

    // data is empty here
    const [err, data] = await service.log(request);

    if (err) throw err;

    runInAction(() => {
      const lastLog = this.log[type][0];
      let restLogs = this.log[type].filter((x) => !payload.startsWith(x.searchTerm));

      if (lastLog) {
        // most likelly user is deliting type
        const lastLogMatch = lastLog.searchTerm.startsWith(payload);
        if (lastLogMatch) {
          restLogs = this.log[type].filter((x) => !x.searchTerm.startsWith(payload));
        }
      }

      const newLogs = {
        ...this.log,
        [type]: [...[request], ...restLogs],
      };

      this.log = newLogs;

      localStorage.setItem(LOCAL_STORAGE_LOG, JSON.stringify(newLogs));
    });

    return data;
  }

  removeLog(log) {
    runInAction(() => {
      const newLogs = {
        ...this.log,
        [log.categoryId]: [...this.log[log.categoryId].filter((x) => x.searchTerm !== log.searchTerm)],
      };
      this.log = newLogs;

      localStorage.setItem(LOCAL_STORAGE_LOG, JSON.stringify(newLogs));
    });
  }
  removeLogs(log) {
    runInAction(() => {
      const newLogs = {
        ...this.log,
        [log]: [],
      };
      this.log = newLogs;

      localStorage.setItem(LOCAL_STORAGE_LOG, JSON.stringify(newLogs));
    });
  }

  // api actions
  async init() {
    if (localStorage.getItem(LOCAL_STORAGE_SESSION)) {
      const lsSession = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SESSION));
      const lsLog = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LOG));

      const { sessionId, cartId, cartNumber } = lsSession;

      runInAction(() => {
        this.sessionId = sessionId;
        this.cartId = cartId;
        this.cartNumber = cartNumber;
      });

      try {
        await this.aliveSession({ sessionId, cartId });
        try {
          await cart.getCart({ cartId });
        } catch {
          // todo - create new cart
        }

        runInAction(() => {
          this.log = lsLog ? lsLog : this.log;
        });
      } catch {
        await this.createSession();
      }
    } else {
      await this.createSession();
    }
  }

  async createSession() {
    localStorage.removeItem(LOCAL_STORAGE_SESSION);
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

  // multitab ls feature
  hydrateStore() {
    const lsSession = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SESSION));

    const { sessionId, cartId, cartNumber } = lsSession;

    runInAction(() => {
      this.sessionId = sessionId;
      this.cartId = cartId;
      this.cartNumber = cartNumber;
    });

    localStorage.setItem(LOCAL_STORAGE_SESSION, localStorage.getItem(LOCAL_STORAGE_SESSION));
  }
}
