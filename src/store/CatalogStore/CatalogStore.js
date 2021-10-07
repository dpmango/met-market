import { makeAutoObservable, runInAction } from 'mobx';
import { computedFn } from 'mobx-utils';
import { findNodeById, findNodeByName, formatPrice } from '@helpers';
import qs from 'qs';
import { prepareSmartSearchRegexp, clearMorphologyInSearchTerm } from '@helpers/Strings';

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
    id: item.id,
  });

  // main Cataloag getter including filters
  get catalogLength() {
    return this.catalog.length;
  }

  catalogList = computedFn((cat_id, filters) => {
    let returnable = [];

    if (cat_id) {
      const items = this.catalog.filter((x) => x.idUnique.split('|').includes(cat_id));

      if (items && items.length > 0) {
        returnable = items;
      }
    } else {
      returnable = this.catalog;
    }

    const sizeFilter = filters.size.map((v) => v.value);
    const markFilter = filters.mark.map((v) => v.value);
    const lengthFilter = filters.length.map((v) => v.value);

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

    return returnable
      .filter(filterSize)
      .filter(filterMark)
      .filter(filterLength)
      .map((x) => this.normalizeCatalogItem(x));
  });

  getCatalogItem = computedFn((item_id) => {
    return this.catalog.find((x) => x.id === item_id);
  });

  // search in catalog searchTerms any match
  // todo - what kind of morphology processing is required ?
  // TODO - test performance hit in render ms
  searchCatalog = computedFn((txt, category_id) => {
    let source = this.catalog;

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

    const matches = source.filter((x) => {
      const terms = x.searchTerms ? x.searchTerms.toLowerCase() : null;

      if (terms) {
        const test = prepareSmartSearchRegexp(clearMorphologyInSearchTerm(txt.toLowerCase()));
        const regex = new RegExp(test, 'i');

        return regex.test(terms);

        // const queries = txt.toLowerCase().split(' ');
        // return queries.every((q) => terms.split(' ').some((str) => str.includes(q)));
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

  //////////////
  // categories
  /////////////
  get categoriesList() {
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

    return sorting.map((key) => ({
      ...mappedList.find((x) => x.id === key),
    }));
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
          const matchedCatalogList = this.catalogList(cat_id, this.filters);
          const mappedFilter = matchedCatalogList.map((x) => {
            return { size: x.size, mark: x.mark, length: x.length };
          });

          // iterate filter select values through matching catalog element
          // (sort out not found display values)
          const haveFilter = (f) => f && f.length > 0;
          const shouldFilterSize = !haveFilter(sizeFilter) && (haveFilter(markFilter) || haveFilter(lengthFilter));
          const shouldFilterMark = !haveFilter(markFilter) && (haveFilter(sizeFilter) || haveFilter(lengthFilter));
          const shouldFilterLength = !haveFilter(lengthFilter) && (haveFilter(sizeFilter) || haveFilter(markFilter));

          const filterSize = (size) => {
            if (shouldFilterSize) {
              return mappedFilter.map((catMap) => catMap.size).includes(size);
            }
            return true;
          };

          const filterMark = (mark) => {
            if (shouldFilterMark) {
              return mappedFilter.map((catMap) => catMap.mark).includes(mark.name);
            }

            return true;
          };

          const filterLength = (length) => {
            if (shouldFilterLength) {
              return mappedFilter.map((catMap) => catMap.length).includes(length);
            }

            return true;
          };

          return {
            size: cat_filters.size.filter(filterSize),
            mark: cat_filters.mark.filter(filterMark),
            length: cat_filters.length.filter(filterLength),
          };
        };

        return {
          id: cat_id,
          title: category.name,
          image: category.image,
          ancestors: category.ancestors,
          subcategories: mergedCategories,
          filters: category.filters ? processFilters(category.filters) : null,
        };
      }
    }

    return false;
  });

  get someFiltersActive() {
    return this.filters.size.length || this.filters.mark.length || this.filters.length.length;
  }
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

    this.filters = { ...upFilter };
  }
}
