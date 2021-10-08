import { PerformanceLog } from '@helpers';

export const updateQueryParams = ({ history, location, query, payload }) => {
  const DEV_perf = performance.now();

  const params = query || new URLSearchParams();
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
    case 'clear-modals':
      params.delete('product');
      break;

    case 'cart':
      if (payload.value) {
        mergeParam('cart', payload.value);
      } else {
        params.delete('cart');
      }

      break;

    case 'product':
      mergeParam('product', payload.value);

      break;

    case 'category':
      params.delete('page');

      if (payload.value) {
        mergeParam('category', payload.value);
      } else {
        params.delete('category');
      }

      break;

    case 'page':
      if (payload.value) {
        mergeParam('page', payload.value);
      } else {
        params.delete('page');
      }

      break;

    case 'search':
      if (params.get('category') === 'all') {
        params.delete('category');
      }

      if (payload.value) {
        mergeParam('search', payload.value);
      } else {
        params.delete('search');
      }

      break;

    case 'filter':
      const filter = payload.value;

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

    default:
      break;
  }

  if (curParams !== params.toString()) {
    console.log('QUERY :: pushing params', params.toString());
    history.push({
      pathname: location.pathname,
      search: params.toString(),
    });
  }
  PerformanceLog(DEV_perf, 'updateQueryParams');
};
