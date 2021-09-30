import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { findNodeById, formatPrice } from '@helpers';

import service from './api-service';

export default class CatalogStore {
  loading = true;
  date = null;
  catalog = [];
  categories = [];
  filters = {
    size: [],
    mark: [],
    length: [],
  };

  constructor() {
    makeAutoObservable(this);

    this.getCatalog();
  }

  // catalog
  catalogList = computedFn((cat_id, filters) => {
    const mappingFunction = (item) => ({
      name: item.name,
      size: item.size[0],
      mark: item.mark[0],
      length: item.length[0],
      price: `${formatPrice(item.price, 0)} ₽/${item.priceQuantityUnit}`,
      id: item.id,
    });

    const filterFunction = (item) => {
      let someMatched = null;

      if (filters.size && filters.size.length) {
        someMatched = item.size.some((x) => filters.size.map((v) => v.value).includes(x));
      }

      if (filters.mark && filters.mark.length) {
        someMatched = item.mark.some((x) => filters.mark.map((v) => v.value).includes(x));
      }

      if (filters.length && filters.length.length) {
        someMatched = item.length.some((x) => filters.length.map((v) => v.value).includes(x));
      }

      return someMatched !== null ? someMatched : true;
    };

    if (cat_id) {
      const items = this.catalog.filter((x) => x.idUnique.includes(cat_id));

      if (items && items.length > 0) {
        return items.filter((x) => filterFunction(x)).map((x) => mappingFunction(x));
      }
    }

    return this.catalog.filter((x) => filterFunction(x)).map((x) => mappingFunction(x));
  });

  getCatalogItem = computedFn((item_id) => {
    return this.catalog.find((x) => x.id === item_id);
  });

  // categories
  get categoriesList() {
    if (this.categories.length === 0) {
      return [];
    }

    const mappedList = this.categories.map((cat1) => ({
      id: cat1.id,
      name: cat1.name,
      categories:
        cat1.categories &&
        cat1.categories.map((cat2) => ({
          id: cat2.id,
          // cat1: cat1.id,
          name: cat2.name,
          categories:
            cat2.categories &&
            cat2.categories.map((cat3) => ({
              id: cat3.id,
              // cat1: cat1.id,
              // cat2: cat2.id,
              name: cat3.name,
            })),
        })),
    }));

    const sorting = ['sortovoy', 'listovoy', 'nerzhaveyuschy', 'metizy', 'steel', 'prokat_trub', 'sudovaya_stal'];

    return sorting.map((key) => ({
      ...mappedList.find((x) => x.id === key),
    }));
  }

  getCategoryFilters = computedFn((cat_id) => {
    if (this.categories && this.categories.length) {
      // get depths first
      const category = findNodeById(this.categories, cat_id);

      if (category) {
        return {
          id: cat_id,
          title: category.name,
          subcategories: category.categories || null, // todo if empty, find parent
          filters: category.filters || null,
        };
      }
    }

    return false;
  });

  // ACTIONS
  async getCatalog() {
    runInAction(() => {
      this.loading = true;
    });

    const [err, result] = await service.get();

    if (err) throw err;

    const { date, data, categories } = result;

    runInAction(() => {
      console.log(data);
      this.date = date;
      this.catalog = data;
      this.categories = categories.categories;
      this.loading = false;
    });

    return result;
  }

  //static methods
  setFilters(val, key) {
    this.filters = {
      ...this.filters,
      ...{ [key]: val },
    };
  }
}
