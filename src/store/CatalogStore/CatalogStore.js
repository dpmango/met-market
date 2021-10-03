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

  /////////////
  // CATALOG
  /////////////
  normalizeCatalogItem = (item) => ({
    name: item.name,
    size: item.size[0],
    mark: item.mark[0],
    length: item.length[0],
    price: `${formatPrice(item.price, 0)} ₽/${item.priceQuantityUnit}`,
    id: item.id,
  });

  // main Cataloag getter including filters
  catalogList = computedFn((cat_id, filters) => {
    const filterFunction = (item) => {
      let someMatched = null;

      // TODO - refactor to all match vs ANY
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
        return items.filter((x) => filterFunction(x)).map((x) => this.normalizeCatalogItem(x));
      }
    }

    return this.catalog.filter((x) => filterFunction(x)).map((x) => this.normalizeCatalogItem(x));
  });

  getCatalogItem = computedFn((item_id) => {
    return this.catalog.find((x) => x.id === item_id);
  });

  // search in catalog searchTerms any match
  // todo - what kind of morphology processing is required ?
  // TODO - test performance hit in render ms
  searchCatalog = computedFn((txt) => {
    const matches = this.catalog.filter((x) => {
      const terms = x.searchTerms ? x.searchTerms.toLowerCase() : null;

      if (terms) {
        const queries = txt.toLowerCase().split(' ');
        return queries.some((q) => terms.includes(q));
      }

      return false;
    });

    const suggestions = matches.map((item) => this.normalizeCatalogItem(item));

    return {
      meta: {
        total: matches.length,
      },
      suggestions: suggestions ? suggestions : [],
    };
  });

  // categories
  get categoriesList() {
    if (this.categories.length === 0) {
      return [];
    }

    const mappedList = this.categories.map((cat1) => ({
      id: cat1.id,
      name: cat1.name,
      filters: cat1.filters,
      categories:
        cat1.categories &&
        cat1.categories.map((cat2) => ({
          id: cat2.id,
          name: cat2.name,
          filters: cat2.filters,
          ancestors: [
            {
              id: cat1.id,
              name: cat1.name,
            },
          ],
          categories:
            cat2.categories &&
            cat2.categories.map((cat3) => ({
              id: cat3.id,
              name: cat3.name,
              filters: cat3.filters,
              ancestors: [
                {
                  id: cat1.id,
                  name: cat1.name,
                },
                {
                  id: cat2.id,
                  name: cat2.name,
                },
              ],
            })),
        })),
    }));

    const sorting = ['sortovoy', 'listovoy', 'nerzhaveyuschy', 'metizy', 'steel', 'prokat_trub', 'sudovaya_stal'];

    return sorting.map((key) => ({
      ...mappedList.find((x) => x.id === key),
    }));
  }

  getCategoryFilters = computedFn((cat_id) => {
    if (this.categoriesList && this.categoriesList.length) {
      // get depths first
      const category = findNodeById(this.categoriesList, cat_id);

      if (category) {
        const getAncestors = (catagory) => {
          console.log('ancestors', category.ancestors);
          return [];
        };

        // show tags from parent category
        // todo ability to show filters from parent (not found)
        let parentCategory = [];
        this.categoriesList.forEach((lvl1) => {
          lvl1.categories.forEach((lvl2) => {
            const matchLvl3 = lvl2.categories ? lvl2.categories.some((x) => x.id === cat_id) : false;

            if (matchLvl3) {
              parentCategory = lvl2;
            }
          });
        });

        const lastLevel = !category.categories;

        const mergedCategories = lastLevel
          ? parentCategory
            ? [
                {
                  id: parentCategory.id,
                  name: `Все товары категории «${parentCategory.name}»`,
                },
                ...(parentCategory.categories || []),
              ]
            : []
          : [
              {
                id: cat_id,
                name: `Все товары категории «${category.name}»`,
              },
              ...(category.categories || []),
            ];

        return {
          id: cat_id,
          title: category.name,
          ancestors: category.ancestors,
          subcategories: mergedCategories,
          filters: category.filters || null,
        };
      }
    }

    return false;
  });

  // API ACTIONS
  async getCatalog() {
    runInAction(() => {
      this.loading = true;
    });

    const [err, result] = await service.get();

    if (err) throw err;

    const { date, data, categories } = result;

    runInAction(() => {
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
