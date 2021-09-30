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

  // actions
  async getCart(req) {
    const [err, data] = await service.get(req);

    if (err) throw err;

    runInAction(() => {
      this.cart = data;
    });

    return data;
  }

  async addCartItem(req) {
    // todo - temp action on top
    runInAction(() => {
      this.cart = [...this.cart, ...[req]];
    });

    const [err, data] = await service.add({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    return data;
  }

  async updateCartItem(req) {
    runInAction(() => {
      this.cart = this.cart.map((x) =>
        x.itemId === req.itemId
          ? {
              ...x,
              ...req,
            }
          : x
      );
    });

    const [err, data] = await service.update({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    return data;
  }

  async removeCartItem(req) {
    // todo - temp action on top
    runInAction(() => {
      this.cart = this.cart.filter((x) => x.itemId !== req.itemId);
    });

    const [err, data] = await service.remove({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    // runInAction(() => {
    //   this.cart = data;
    // });

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
