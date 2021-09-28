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

  get catalogList() {
    return this.catalog;
  }

  get categoriesList() {
    if (this.categories.length === 0) {
      return [];
    }

    const simpleList = this.categories.map((cat1) => ({
      id: cat1.id,
      name: cat1.name,
      categories:
        cat1.categories &&
        cat1.categories.map((cat2) => ({
          id: cat2.id,
          name: cat2.name,
          categories:
            cat2.categories &&
            cat2.categories.map((cat3) => ({
              id: cat3.id,
              name: cat3.name,
            })),
        })),
    }));

    const sorting = ['sortovoy', 'listovoy', 'nerzhaveyuschy', 'metizy', 'steel', 'prokat_trub', 'sudovaya_stal'];

    return sorting.map((key) => ({
      ...simpleList.find((x) => x.id === key),
    }));
  }

  // actions
  async getCatalog() {
    const [err, result] = await service.get();

    if (err) throw err;

    const { date, data, categories } = result;

    runInAction(() => {
      this.date = date;
      this.catalog = data;
      this.categories = categories.categories;
    });

    return result;
  }
}
