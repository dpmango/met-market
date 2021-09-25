import { makeAutoObservable, runInAction } from 'mobx';
// import { computedFn } from 'mobx-utils';
import { setDefaultAxiosParam } from '@api';

import service from './api-service';

export default class CatalogStore {
  date = null;
  catalog = [];
  categories = [];

  constructor() {
    makeAutoObservable(this);
  }

  get getCatalog() {
    return this.catalog;
  }

  // actions
  async getCatalog() {
    const [err, result] = await service.get();

    if (err) throw err;

    const { date, data, categories } = result;

    runInAction(() => {
      this.date = date;
      this.catalog = data;
      this.categories = categories;
    });

    return result;
  }
}
