import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { findNodeById, findNodeByName, formatPrice } from '@helpers';
import qs from 'qs';
import groupBy from 'lodash/groupBy';
import { prepareSmartSearchRegexp, clearMorphologyInSearchTerm } from '@helpers/Strings';
import { PerformanceLog } from '@helpers';
import { LOCAL_STORAGE_CATALOG } from '@config/localStorage';
import { ui } from '@store';

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

  applyCatalogFilters(catalog, filterType) {
    const sizeFilter = this.filters.size.map((v) => (v.value !== 'не указано' ? v.value : ''));
    const markFilter = this.filters.mark.map((v) => (v.value !== 'не указано' ? v.value : ''));
    const lengthFilter = this.filters.length.map((v) => (v.value !== 'не указано' ? v.value : ''));

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

    const mergedFilter = (item) => {
      let matched = true;

      const allFilters = [item.size, item.mark, item.length];
      const mergedFilter = [sizeFilter, markFilter, lengthFilter];

      if (sizeFilter.length > 0 || markFilter.length > 0 || lengthFilter.length > 0) {
        matched = allFilters.some((filter, idx) => {
          return filter.some((val) => mergedFilter[idx].includes(val));
        });
      }

      return matched;
    };

    let result = [];
    if (filterType === 'merged') {
      result = catalog.filter(mergedFilter);
    } else {
      result = catalog.filter(filterSize).filter(filterMark).filter(filterLength);
    }

    return result;
  }

  catalogList = computedFn((cat_id, filterType) => {
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

    const result = {
      results: this.applyCatalogFilters(returnable, filterType).map((x) => this.normalizeCatalogItem(x)),
      // withoutFilter: returnable.map((x) => this.normalizeCatalogItem(x)),
    };

    PerformanceLog(DEV_perf, 'catalogList');
    return result;
  });

  getCatalogItem = computedFn((item_id) => {
    return this.catalog.find((x) => x.idUnique === item_id);
  });

  // search in catalog searchTerms any match
  searchCatalog = computedFn((searchInput, category_id, filterType) => {
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

    // generate regex with simple morhpology
    const searchRegex = prepareSmartSearchRegexp(clearMorphologyInSearchTerm(searchInput.toLowerCase()));

    const doRegexSearch = (source) => {
      const matches = source.filter((x) => {
        const terms = x.searchTerms ? x.searchTerms.toLowerCase() : null;

        return terms ? new RegExp(searchRegex, 'i').test(terms) : false;
      });

      return matches || [];
    };

    const searched = doRegexSearch(this.applyCatalogFilters(source, filterType));

    const result = {
      meta: {
        total: searched.length,
      },
      results: searched.map((item) => this.normalizeCatalogItem(item)),
      // withoutFilter: doRegexSearch(source).map((item) => this.normalizeCatalogItem(item)),
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
          short: lvl1.shortName,
        });

        if (lvl1.categories && lvl1.categories.length > 0) {
          lvl1.categories.forEach((lvl2) => {
            result.push({
              id: lvl2.id,
              name: lvl2.name,
              short: lvl2.shortName,
            });

            if (lvl2.categories && lvl2.categories.length > 0) {
              lvl2.categories.forEach((lvl3) => {
                result.push({
                  id: lvl3.id,
                  name: lvl3.name,
                  short: lvl3.shortName,
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
          const matchLvl2 = lvl1.categories ? lvl1.categories.some((x) => x.id === cat_id) : false;
          lvl1.categories.forEach((lvl2) => {
            const matchLvl3 = lvl2.categories ? lvl2.categories.some((x) => x.id === cat_id) : false;

            if (matchLvl3) {
              parentCategory = lvl2;
            } else if (matchLvl2) {
              parentCategory = lvl1;
            }
          });
        });

        const lastLevel = !category.categories;

        console.log(parentCategory);
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

          // find store items matching filters (table display list)
          let matchedCatalogList = [];

          if (ui.query.search) {
            const { results } = this.searchCatalog(ui.query.search, cat_id, 'merged');
            matchedCatalogList = results;
          } else {
            const { results } = this.catalogList(cat_id, 'merged');
            matchedCatalogList = results;
          }

          const mappedFilter = matchedCatalogList.map((x) => {
            return { size: x.size, mark: x.mark, length: x.length };
          });

          const sizesMatched = mappedFilter.map((catMap) => catMap.size);
          const marksMatched = mappedFilter.map((catMap) => catMap.mark);
          const lengthsMatched = mappedFilter.map((catMap) => catMap.length);

          const clearValue = (x) => {
            return !x ? 'не указано' : x;
          };

          // filtering thought mapped available/disabled state
          const filterSize = (size) => {
            return {
              value: clearValue(size),
              isPopular: size.isPopular !== undefined ? mark.isPopular : false,
              available: sizesMatched.includes(size),
            };
          };

          const filterMark = (mark) => {
            return {
              value: clearValue(mark.name),
              isPopular: mark.isPopular !== undefined ? mark.isPopular : false,
              available: marksMatched.includes(mark.name),
            };
          };

          const filterLength = (length) => {
            return {
              value: clearValue(length),
              isPopular: length.isPopular !== undefined ? length.isPopular : false,
              available: lengthsMatched.includes(length),
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
