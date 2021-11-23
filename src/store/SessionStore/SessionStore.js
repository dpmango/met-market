import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import axios from 'axios';

import { cart } from '@store';
import { UtmWhitelist } from '@helpers/Utm';
import { LOCAL_STORAGE_SESSION, LOCAL_STORAGE_LOG, LOCAL_STORAGE_UTM_PARAMS } from '@config/localStorage';
import service from './api-service';

export default class SessionStore {
  sessionId = null;
  sessionParams = {};
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
    window.sessionStore = this;
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
    const [err, data] = await service.logCatalog(request);

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
  /**
   @action init
   @description
    сперва пытаемся получить сессию из localStorage либо создаем новую
    делаем запрос на alive сессии и получение корзины
    если корзину не удалось получить, создается новая внутри одной сессии
    при ошибках пересоздаем сессию
  **/
  async init() {
    if (localStorage.getItem(LOCAL_STORAGE_SESSION)) {
      const lsSession = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SESSION));
      const lsLog = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LOG));

      const { sessionId, cartId, cartNumber } = lsSession;

      runInAction(() => {
        this.sessionId = sessionId;
        this.cartNumber = cartNumber;
      });

      let newSessionOnErr = true;
      try {
        await this.aliveSession({ sessionId, cartId });
        try {
          await cart.getCart({ cartId: cartId });

          this.setSession({ sessionId, cartId, cartNumber });
        } catch (err) {
          if (err.response && [400, 404].includes(err.response.status)) {
            const status = err.response && err.response.status;

            await cart.createNewCart({ sessionId }).then((res) => {
              const { sessionId, cartNumber, cartId } = res;
              newSessionOnErr = false;
              this.setSession({ sessionId, cartId, cartNumber });
            });
          }
        }

        runInAction(() => {
          this.log = lsLog ? lsLog : this.log;
        });
      } catch {
        if (newSessionOnErr) {
          await this.createSession();
        }
      }
    } else {
      await this.createSession();
    }

    // external methods
    window.setGaClientId();
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

  // Получение параметров напрямую из location без роутера
  // сохранение в localStorage для сравнения строк
  // при изминении, повторная отправка парамтеров пачкой
  async sendUtmParams(location) {
    const { host, search } = location;

    const savedParams = JSON.parse(localStorage.getItem(LOCAL_STORAGE_UTM_PARAMS));

    const qParamsString = search.slice(1, search.length);
    let utmParams = {};

    // clear and compare anly allowed utm marks
    const qParamsCleared =
      qParamsString &&
      qParamsString
        .split('&')
        .filter((param) => {
          const [key] = param.split('=');
          return UtmWhitelist.includes(key);
        })
        .join('&');

    // send new params only if changed and any present
    if (qParamsCleared.length && savedParams !== qParamsCleared) {
      if (!['met.market'].includes(host)) {
        utmParams = {
          ...utmParams,
          referer: host,
        };
      }

      qParamsCleared &&
        qParamsCleared.split('&').forEach((param) => {
          const [key, value] = param.split('=');

          utmParams = {
            ...utmParams,
            [key]: value,
          };
        });

      await this.addSessionParams(utmParams);

      localStorage.setItem(LOCAL_STORAGE_UTM_PARAMS, JSON.stringify(qParamsCleared));
    }
  }

  // метод отправки параметров к сессии
  // через запрос к бекенду
  async addSessionParams(params) {
    console.log({ params });
    const [err, result] = await service.addParams({
      sessionId: this.sessionId,
      params: { ...params },
    });

    if (err) throw err;

    runInAction(() => {
      this.sessionParams = {
        ...this.sessionParams,
        ...params,
      };
    });
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
