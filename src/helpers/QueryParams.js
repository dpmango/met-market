import { ui, catalog } from '@store';
import { PerformanceLog } from '@helpers';

export const updateQueryParams = ({ history, location, payload }) => {
  const DEV_perf = performance.now();

  const params = ui.query.origin || new URLSearchParams();
  const curParams = params.toString();

  const mergeParam = (name, value) => {
    if (params.get(name)) {
      params.set(name, value);
    } else {
      params.append(name, value);
    }
  };

  // console.log('QUERY :: update payload', payload);

  switch (payload.type) {
    case 'delete':
      if (Array.isArray(payload.value)) {
        payload.value.forEach((key) => {
          params.delete(key);
        });
      } else if (payload.value) {
        params.delete(payload.value);
      }

      break;

    case 'product':
      if (payload.value) {
        mergeParam('product', payload.value);
      } else {
        params.delete('product');
      }

      break;

    case 'category':
      params.delete('page');
      params.delete('search');
      params.delete('size');
      params.delete('mark');
      params.delete('length');

      if (payload.value) {
        mergeParam('category', payload.value);
      } else {
        params.delete('category');
      }

      break;

    case 'page':
      if (payload.value && payload.value > 1) {
        mergeParam('page', payload.value);
      } else {
        params.delete('page');
      }

      break;

    case 'search':
      if (params.get('category') === 'all') {
        params.delete('category');
      }

      if (params.get('category')) {
        const categoryExist = catalog.getCategoryById(params.get('category'));

        if (!categoryExist) {
          params.delete('category');
        }
      }

      if (payload.value) {
        params.delete('page');
        mergeParam('search', payload.value);
      } else {
        params.delete('search');
      }

      break;

    case 'filter':
      const filter = payload.value;

      params.delete('page');

      if (filter.size && filter.size.length > 0) {
        mergeParam('size', filter.size.map((x) => x.value).join('|'));
      } else {
        params.delete('size');
      }

      if (filter.mark && filter.mark.length > 0) {
        mergeParam('mark', filter.mark.map((x) => x.value).join('|'));
      } else {
        params.delete('mark');
      }

      if (filter.length && filter.length.length > 0) {
        mergeParam('length', filter.length.map((x) => x.value).join('|'));
      } else {
        params.delete('length');
      }

      break;

    case 'cart':
      params.delete('product');
      params.delete('callback');
      if (payload.value) {
        mergeParam('cart', payload.value);
      } else {
        params.delete('cart');
      }

      break;

    case 'callback':
      params.delete('product');
      params.delete('cart');
      if (payload.value) {
        mergeParam('callback', payload.value);
      } else {
        params.delete('callback');
      }

      break;

    default:
      break;
  }

  if (curParams !== params.toString() || location.pathname !== '/') {
    console.log('QUERY :: Push :: ', params.toString());

    // ui.updateParams(params);

    history.push({
      pathname: '/',
      search: params.toString(),
    });
  }

  PerformanceLog(DEV_perf, 'queryParams');
};
