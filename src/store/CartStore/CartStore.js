import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';

import { session } from '@store';
import service from './api-service';

export default class CartStore {
  cart = [];

  constructor() {
    makeAutoObservable(this);
  }

  // getters
  getItemInCart = computedFn((item_id) => {
    return this.cart.find((x) => x.itemId === item_id);
  });

  get cartCount() {
    return this.cart.length;
  }

  get cartItemIds() {
    return this.cart.map((x) => x.itemId);
  }

  get cartTotal() {
    return this.cart.reduce((acc, x) => (acc += x.pricePerItem * x.count), 0);
  }

  // actions
  async getCart(req) {
    const [err, data] = await service.get(req);

    if (err) throw err;

    const { items } = data;

    runInAction(() => {
      this.cart = items;
    });

    return items;
  }

  async addCartItem(req) {
    const [err, data] = await service.add({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    const { items } = data;

    runInAction(() => {
      this.cart = items;
    });

    return data;
  }

  async updateCartItem(req) {
    const [err, data] = await service.update({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    runInAction(() => {
      this.cart = items;
    });

    return data;
  }

  async removeCartItem(req) {
    const [err, data] = await service.remove({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    runInAction(() => {
      this.cart = this.cart.filter((x) => x.itemId !== req.itemId);
    });

    return data;
  }

  async submitCart(req) {
    const [err, data] = await service.submit({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    // runInAction(() => {
    //   this.cart = data;
    // });

    return data;
  }
}
