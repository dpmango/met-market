import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import axios from 'axios';

import { cart } from '@store';
import { UtmWhitelist } from '@helpers/Utm';
import { EVENTLIST, logEvent } from '@helpers';
import { LOCAL_STORAGE_SESSION, LOCAL_STORAGE_LOG, LOCAL_STORAGE_UTM_PARAMS } from '@config/localStorage';
import service from './api-service';

export default class SessionStore {
  sessionId = null;
  sessionParams = {};
  sessionNumber = null;
  cartId = null;
  cartNumber = null;
  savedSearch = '';
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

  get telegramLink() {
    const base = 'https://t.me/METMarket_bot';
    if (this.sessionParams.amoVisitorUid) {
      return `${base}?start=VisitorUid_${this.sessionParams.amoVisitorUid}`;
    }

    return base;
  }

  get whatsappLink() {
    const base = 'https://api.whatsapp.com/send/?phone=74951043130';
    if (this.cartNumber) {
      return `${base}&text=%D0%92%D0%B0%D1%88+%D0%BD%D0%BE%D0%BC%D0%B5%D1%80+%D0%BA%D0%BB%D0%B8%D0%B5%D0%BD%D1%82%D0%B0%3A+${this.cartNumber}%2C+%D0%BE%D1%82%D0%BF%D1%80%D0%B0%D0%B2%D1%8C%D1%82%D0%B5+%D1%8D%D1%82%D0%BE+%D1%81%D0%BE%D0%BE%D0%B1%D1%89%D0%B5%D0%BD%D0%B8%D0%B5+%D0%B4%D0%BB%D1%8F+%D0%BF%D0%BE%D0%BB%D1%83%D1%87%D0%B5%D0%BD%D0%B8%D1%8F+%D0%BA%D0%BE%D0%BD%D1%81%D1%83%D0%BB%D1%8C%D1%82%D0%B0%D1%86%D0%B8%D0%B8.&app_absent=0`;
    }

    return base;
  }

  // inner actions
  setSession(newSession) {
    const { sessionId, cartId, sessionNumber, cartNumber } = newSession;

    runInAction(() => {
      this.sessionId = sessionId;
      this.sessionNumber = sessionNumber;
      this.cartId = cartId;
      this.cartNumber = cartNumber;

      localStorage.setItem(LOCAL_STORAGE_SESSION, JSON.stringify(newSession));
    });
  }

  saveSearch(txt) {
    runInAction(() => {
      this.savedSearch = txt;
    });
  }

  setLog({ type, payload }) {
    const request = {
      sessionId: this.sessionId,
      searchTerm: payload,
    };

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
    // migration
    let useMigration = false;
    let sessionId = null;
    let sessionNumber = null;
    let cartId = null;
    let cartNumber = null;

    // ищет последнюю актуальную версию сессии. every позволяет выйти из цикла
    const versionsList = [
      'metMarketSession',
      'metMarketSession_1.1.6',
      'metMarketSession_1.2.0',
      'metMarketSession_1.2.1',
      'metMarketSession_1.2.2',
      'metMarketCatalog_1.2.3',
    ];
    versionsList.reverse().every((key) => {
      const lsSession = localStorage.getItem(key);
      if (lsSession) {
        const lsSessionObj = JSON.parse(lsSession);

        sessionId = lsSessionObj.sessionId;
        sessionNumber = lsSessionObj.sessionNumber;
        cartId = lsSessionObj.cartId;
        cartNumber = lsSessionObj.cartNumber;

        useMigration = true;

        return false;
      }

      return true;
    });

    // уже запомнили в переменную, очищаем старые версии
    versionsList.forEach((key) => {
      localStorage.removeItem(key);
    });

    if (localStorage.getItem(LOCAL_STORAGE_SESSION) || useMigration) {
      if (localStorage.getItem(LOCAL_STORAGE_SESSION)) {
        // даже если используются миграция, в приоритете данные из актуальной версии LS
        const lsSession = JSON.parse(localStorage.getItem(LOCAL_STORAGE_SESSION));

        sessionId = lsSession.sessionId;
        sessionNumber = lsSession.sessionNumber;
        cartId = lsSession.cartId;
        cartNumber = lsSession.cartNumber;
      }

      runInAction(() => {
        this.sessionId = sessionId;
        this.sessionNumber = sessionNumber;
        this.cartId = cartId;
        this.cartNumber = cartNumber;
      });

      let newSessionOnErr = true;
      try {
        await this.aliveSession({ sessionId, cartId });
        try {
          await cart.getCart({ cartId: cartId });

          this.setSession({ sessionId, sessionNumber, cartId, cartNumber });
        } catch (err) {
          if (err.response && [400, 404].includes(err.response.status)) {
            const status = err.response && err.response.status;

            await cart.createNewCart({ sessionId }).then((res) => {
              const { sessionId, sessionNumber, cartNumber, cartId } = res;
              newSessionOnErr = false;
              this.setSession({ sessionId, sessionNumber, cartId, cartNumber });
            });
          }
        }

        // установка лога поиска
        const lsLog = JSON.parse(localStorage.getItem(LOCAL_STORAGE_LOG));

        runInAction(() => {
          this.log = lsLog ? lsLog : this.log;
        });
      } catch (err) {
        if (newSessionOnErr && err.response && [400, 404].includes(err.response.status)) {
          await this.createSession();
        }
      }
    } else {
      await this.createSession();
    }

    // external methods for metrics
    logEvent({
      name: EVENTLIST.PAGELOAD,
      params: {
        url: window.location.href,
      },
    });

    window.createGATag(this.sessionNumber);
    window.initMetrika();
    window.createAmoTag();
    if (process.env.NODE_ENV === 'production') {
      window.createComagicTag(this.sessionNumber);
    }
  }

  async createSession() {
    // localStorage.removeItem(LOCAL_STORAGE_SESSION);
    const [err, data] = await service.create();

    if (err) throw err;

    const { sessionId, sessionNumber, cartId, cartNumber } = data;

    this.setSession({ sessionId, sessionNumber, cartId, cartNumber });

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

  async logCatalog({ eventId, categoryId, searchTerm, productsCount, filterSize, filterMark, filterLength }) {
    const request = {
      sessionId: this.sessionId,
      eventId,
      categoryId,
      searchTerm,
      filterSize,
      filterMark,
      filterLength,
      productsCount,
    };

    const [err, data] = await service.logCatalog(request);

    if (err) throw err;

    return data;
  }

  // метод отправки параметров к сессии
  // через запрос к бекенду
  async addSessionParams(params) {
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

    const { sessionId, sessionNumber, cartId, cartNumber } = lsSession;

    runInAction(() => {
      this.sessionId = sessionId;
      this.sessionNumber = sessionNumber;
      this.cartId = cartId;
      this.cartNumber = cartNumber;
    });

    localStorage.setItem(LOCAL_STORAGE_SESSION, localStorage.getItem(LOCAL_STORAGE_SESSION));
  }
}
