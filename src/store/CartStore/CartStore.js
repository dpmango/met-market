import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { makePersistable, hydrateStore } from 'mobx-persist-store';

import { session } from '@store';
import { priceWithTonnage } from '@helpers';
import { LOCAL_STORAGE_CART } from '@config/localStorage';
import service from './api-service';

export default class CartStore {
  cart = [];

  constructor() {
    makeAutoObservable(this);

    makePersistable(this, {
      name: LOCAL_STORAGE_CART,
      properties: ['cart'],
      // debugMode: true,
      storage: window.localStorage,
    });
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
    return this.cart.reduce((acc, x) => (acc += priceWithTonnage(x.pricePerItem, x.count)), 0);
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

  async createNewCart(req) {
    const [err, data] = await service.new({
      sessionId: session.sessionId,
    });

    if (err) throw err;

    const { cartId } = data;

    session.setSession(data);
    await this.getCart({ cartId });

    return data;
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

    return items;
  }

  async updateCartItem(req) {
    const [err, data] = await service.update({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    const { items } = data;

    runInAction(() => {
      this.cart = items;
    });

    return items;
  }

  async removeCartItem(req) {
    const [err, data] = await service.remove({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    const { items } = data;

    runInAction(() => {
      this.cart = items;
      // this.cart = this.cart.filter((x) => x.itemId !== req.itemId);
    });

    return data;
  }

  async submitCart(req) {
    const [err, data] = await service.submit({
      cartId: session.cartId,
      ...req,
    });

    if (err) throw err;

    const { orderNumber, newSession } = data;

    session.setSession(newSession);

    runInAction(() => {
      this.cart = [];
    });

    return orderNumber;
  }

  // multitab ls feature
  hydrateStore() {
    hydrateStore(this);
  }
}
