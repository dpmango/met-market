import { makeAutoObservable, runInAction } from 'mobx';
// import { computedFn } from 'mobx-utils';

import service from './api-service';

export default class CartStore {
  cart = [];

  constructor() {
    makeAutoObservable(this);
  }

  async getCart(req) {
    const [err, data] = await service.get(req);

    if (err) throw err;

    runInAction(() => {
      this.cart = data;
    });

    return data;
  }

  async addCartItem(req) {
    const [err, data] = await service.add(req);

    if (err) throw err;

    // runInAction(() => {
    //   this.cart = data;
    // });

    return data;
  }

  async updateCartItem(req) {
    const [err, data] = await service.update(req);

    if (err) throw err;

    // runInAction(() => {
    //   this.cart = data;
    // });

    return data;
  }

  async removeCartItem(req) {
    const [err, data] = await service.remove(req);

    if (err) throw err;

    // runInAction(() => {
    //   this.cart = data;
    // });

    return data;
  }

  async submitCart(req) {
    const [err, data] = await service.submit(req);

    if (err) throw err;

    // runInAction(() => {
    //   this.cart = data;
    // });

    return data;
  }
}
