import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { findNodeById, findNodeByName, formatPrice } from '@helpers';
import qs from 'qs';
import groupBy from 'lodash/groupBy';
import { prepareSmartSearchRegexp, clearMorphologyInSearchTerm } from '@helpers/Strings';
import { PerformanceLog } from '@helpers';
import { LOCAL_STORAGE_CATALOG } from '@config/localStorage';

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

    // this.queryToFilter(new URLSearchParams(window.location.search));
  }

  /////////////
  // CATALOG
  /////////////
  normalizeCatalogItem = (item) => ({
    category: `${item.cat1}||${item.cat2}||${item.cat3}`,
    name: item.name,
    size: item.size[0],
    mark: item.mark[0],
    length: item.length[0],
    price: `${formatPrice(item.price, 0)} ₽/${item.priceQuantityUnit}`,
    id: item.idUnique,
  });

  // main Cataloag getter including filters
  get catalogLength() {
    return this.catalog.length;
  }

  catalogList = computedFn((cat_id) => {
    const DEV_perf = performance.now();

    let returnable = [];

    // firslty iterate items through matching categories
    if (cat_id) {
      const category = findNodeById(this.categoriesList, cat_id);
      if (category) {
        const items = this.catalog.filter(
          (x) =>
            (x.cat3 && x.cat3.includes(category.name)) ||
            (x.cat2 && x.cat2.includes(category.name)) ||
            (x.cat1 && x.cat1.includes(category.name))
        );

        if (items && items.length > 0) {
          returnable = items;
        }
      }
    } else {
      returnable = this.catalog;
    }

    // then apply filters
    const sizeFilter = this.filters.size.map((v) => v.value);
    const markFilter = this.filters.mark.map((v) => v.value);
    const lengthFilter = this.filters.length.map((v) => v.value);

    const filterSize = (item) => {
      if (sizeFilter && sizeFilter.length) {
        return item.size.some((x) => sizeFilter.includes(x));
      }
      return true;
    };

    const filterMark = (item) => {
      if (markFilter && markFilter.length) {
        return item.mark.some((x) => markFilter.includes(x));
      }

      return true;
    };

    const filterLength = (item) => {
      if (lengthFilter && lengthFilter.length) {
        return item.length.some((x) => lengthFilter.includes(x));
      }
      return true;
    };

    const result = returnable
      .filter(filterSize)
      .filter(filterMark)
      .filter(filterLength)
      .map((x) => this.normalizeCatalogItem(x));

    PerformanceLog(DEV_perf, 'catalogList');
    return result;
  });

  getCatalogItem = computedFn((item_id) => {
    return this.catalog.find((x) => x.idUnique === item_id);
  });

  // search in catalog searchTerms any match
  searchCatalog = computedFn((searchInput, category_id) => {
    let source = this.catalog;
    const DEV_perf = performance.now();

    if (category_id) {
      source = [
        ...source.filter((cat_item) => {
          const { cat1, cat2, cat3 } = cat_item;

          const category_1 = this.getCategoryByName(cat1);
          const category_2 = this.getCategoryByName(cat2);
          const category_3 = this.getCategoryByName(cat3);

          const firstMatch = category_1 && category_1.id.includes(category_id);
          const secondMatch = category_2 && category_2.id.includes(category_id);
          const thirdMatch = category_3 && category_3.id.includes(category_id);

          return firstMatch || secondMatch || thirdMatch;
        }),
      ];
    }

    // TODO - filters matching
    const searchRegex = prepareSmartSearchRegexp(clearMorphologyInSearchTerm(searchInput.toLowerCase()));
    const matches = source.filter((x) => {
      const terms = x.searchTerms ? x.searchTerms.toLowerCase() : null;

      return terms ? new RegExp(searchRegex, 'i').test(terms) : false;

      // if (terms) {
      //   // const queries = clearMorphologyInSearchTerm(searchInput.toLowerCase()).split(' ');
      //   // return queries.every((q) => terms.split(' ').some((str) => str.includes(q)));
      // }
    });

    const suggestions = matches.map((item) => this.normalizeCatalogItem(item));

    const result = {
      meta: {
        total: matches.length,
      },
      suggestions: suggestions ? suggestions : [],
    };

    PerformanceLog(DEV_perf, 'searchCatalog');
    return result;
  });

  //////////////
  // categories
  /////////////
  get categoriesList() {
    const DEV_perf = performance.now();

    if (this.categories.length === 0) {
      return [];
    }

    const mappedList = this.categories.map((cat1) => ({
      id: cat1.id,
      name: cat1.name,
      image: cat1.imageUrl,
      filters: cat1.filters,
      categories:
        cat1.categories &&
        cat1.categories.map((cat2) => ({
          id: cat2.id,
          name: cat2.name,
          image: cat2.imageUrl,
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
              image: cat3.imageUrl,
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

    const result = sorting.map((key) => ({
      ...mappedList.find((x) => x.id === key),
    }));
    PerformanceLog(DEV_perf, 'categoriesList');
    return result;
  }

  get categoriesAbc() {
    const DEV_perf = performance.now();
    let result = [];

    if (this.categories.length > 0) {
      this.categories.forEach((lvl1) => {
        result.push({
          id: lvl1.id,
          name: lvl1.name,
        });

        if (lvl1.categories && lvl1.categories.length > 0) {
          lvl1.categories.forEach((lvl2) => {
            result.push({
              id: lvl2.id,
              name: lvl2.name,
            });

            if (lvl2.categories && lvl2.categories.length > 0) {
              lvl2.categories.forEach((lvl3) => {
                result.push({
                  id: lvl3.id,
                  name: lvl3.name,
                });
              });
            }
          });
        }
      });
    }

    // first letter grouping
    const grouped = groupBy(result, (x) => x.name && x.name[0].toUpperCase());
    const sortedObject = Object.fromEntries(Object.entries(grouped).sort());

    PerformanceLog(DEV_perf, 'categoriesAbc');
    return sortedObject;
  }

  getCategoryByName = computedFn((cat_name) => {
    if (this.categoriesList && this.categoriesList.length) {
      const category = findNodeByName(this.categoriesList, cat_name);
      if (category) {
        return category;
      }
    }

    return false;
  });

  getCategoryFilters = computedFn((cat_id) => {
    const DEV_perf = performance.now();

    if (this.categoriesList && this.categoriesList.length) {
      // get depths first
      const category = findNodeById(this.categoriesList, cat_id);

      if (category) {
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
          ? parentCategory.name
            ? [
                {
                  id: parentCategory.id,
                  name: `Все товары категории «${parentCategory.name}»`,
                },
                ...(parentCategory.categories || []),
              ]
            : []
          : [
              category
                ? {
                    id: cat_id,
                    name: `Все товары категории «${category.name}»`,
                  }
                : [],
              ...(category.categories || []),
            ];

        const processFilters = (cat_filters) => {
          // passing display list of select filters
          const sizeFilter = this.filters.size.map((v) => v.value);
          const markFilter = this.filters.mark.map((v) => v.value);
          const lengthFilter = this.filters.length.map((v) => v.value);

          // find store items matching filters (table display list)
          const matchedCatalogList = this.catalogList(cat_id);
          const mappedFilter = matchedCatalogList.map((x) => {
            return { size: x.size, mark: x.mark, length: x.length };
          });

          const sizes = mappedFilter.map((catMap) => catMap.size);
          const marks = mappedFilter.map((catMap) => catMap.mark);
          const lengths = mappedFilter.map((catMap) => catMap.length);

          // iterate filter select values through matching catalog element
          // (sort out not found display values)
          const haveFilter = (f) => f && f.length > 0;
          // const shouldFilterSize = !haveFilter(sizeFilter) && (haveFilter(markFilter) || haveFilter(lengthFilter));
          // const shouldFilterMark = !haveFilter(markFilter) && (haveFilter(sizeFilter) || haveFilter(lengthFilter));
          // const shouldFilterLength = !haveFilter(lengthFilter) && (haveFilter(sizeFilter) || haveFilter(markFilter));

          const filterSize = (size) => {
            return {
              value: size,
              isPopular: size.isPopular !== undefined ? mark.isPopular : false,
              available: sizes.includes(size),
            };
          };

          const filterMark = (mark) => {
            return {
              value: mark.name,
              isPopular: mark.isPopular !== undefined ? mark.isPopular : false,
              available: marks.includes(mark.name),
            };
          };

          const filterLength = (length) => {
            return {
              value: length,
              isPopular: length.isPopular !== undefined ? length.isPopular : false,
              available: lengths.includes(length),
            };
          };

          return {
            size: cat_filters.size.map(filterSize),
            mark: cat_filters.mark.map(filterMark),
            length: cat_filters.length.map(filterLength),
          };
        };

        const result = {
          id: cat_id,
          title: category.name,
          image: category.image,
          ancestors: category.ancestors,
          subcategories: mergedCategories,
          filters: category.filters ? processFilters(category.filters) : null,
        };

        PerformanceLog(DEV_perf, 'getCategoryFilters');
        return result;
      }
    }

    return false;
  });

  get someFiltersActive() {
    return this.filters.size.length || this.filters.mark.length || this.filters.length.length;
  }

  // API ACTIONS
  async getCatalog() {
    let lastDate = null;

    if (localStorage.getItem(LOCAL_STORAGE_CATALOG)) {
      const lsCatalog = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CATALOG));

      const { date, data, categories } = lsCatalog;

      runInAction(() => {
        this.date = date;
        this.catalog = data;
        this.categories = categories.categories;
        this.loading = false;
      });

      lastDate = date;
    } else {
      runInAction(() => {
        this.loading = true;
      });
    }

    const [err, result] = await service.get(lastDate);

    if (err) throw err;

    const { date, data, categories, timestamp } = result;

    if (lastDate !== date) {
      runInAction(() => {
        this.date = date;
        this.catalog = data;
        this.categories = categories.categories;
        this.loading = false;

        localStorage.setItem(LOCAL_STORAGE_CATALOG, JSON.stringify({ date, data, categories }));
      });
    }

    return result;
  }

  //static methods
  addFilter(option, key) {
    const haveOption = this.filters[key].some((x) => x.value === option.value);

    let newFilter = [...this.filters[key].filter((x) => x.value !== option.value), ...[option]];

    if (haveOption) {
      newFilter = [...this.filters[key].filter((x) => x.value !== option.value)];
    }

    const filters = {
      ...this.filters,
      ...{
        [key]: newFilter,
      },
    };

    this.filters = filters;
    return filters;
  }

  resetFilter(name) {
    let newFilter = {
      ...this.filters,
      ...{
        [name]: [...[]],
      },
    };

    this.filters = newFilter;
    return newFilter;
  }

  resetFilters() {
    // this.filters = {
    //   size: [],
    //   mark: [],
    //   length: [],
    // };
  }

  queryToFilter(query) {
    const params = query;

    const paramsSize = params.get('size');
    const paramsMark = params.get('mark');
    const paramsLength = params.get('length');

    let size = [];
    let mark = [];
    let length = [];

    if (paramsSize) {
      size = paramsSize.split('|').map((x) => ({ value: x, label: x }));
    }

    if (paramsMark) {
      mark = paramsMark.split('|').map((x) => ({ value: x, label: x }));
    }

    if (paramsLength) {
      length = paramsLength.split('|').map((x) => ({ value: x, label: x }));
    }

    const upFilter = {
      size,
      mark,
      length,
    };

    if (this.filters !== upFilter) {
      this.filters = { ...upFilter };
    }
  }
}
