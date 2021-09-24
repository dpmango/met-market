import { makeAutoObservable, runInAction } from 'mobx';
// import { computedFn } from 'mobx-utils';
import Cookies from 'js-cookie';

import { AUTH_TOKEN_COOKIE, AUTH_EMAIL_COOKIE } from '@config/cookie';
import { setDefaultAxiosParam } from '@api';

import service from './api-service';

export default class AuthStore {
  token = null;
  email = null;

  constructor() {
    const token = Cookies.get(AUTH_TOKEN_COOKIE);
    const email = Cookies.get(AUTH_EMAIL_COOKIE);
    if (token) {
      this.token = token;
      this.email = email || null;

      setDefaultAxiosParam('token', token);
    }

    makeAutoObservable(this);
  }

  get isAuthenticated() {
    return Boolean(this.token);
  }

  get userEmail() {
    return this.email;
  }

  // actions
  async auth(params) {
    const [err, result] = await service.auth(params);

    if (err) throw err;

    const { token, email } = result;

    console.log(token, email);

    runInAction(() => {
      this.token = token;
      this.email = email;
    });

    Cookies.set(AUTH_TOKEN_COOKIE, token);
    Cookies.set(AUTH_EMAIL_COOKIE, email);
    setDefaultAxiosParam('token', token);

    return token;
  }

  logout() {
    this.token = null;

    Cookies.remove(AUTH_TOKEN_COOKIE);
    Cookies.remove(AUTH_EMAIL_COOKIE);
  }
}
