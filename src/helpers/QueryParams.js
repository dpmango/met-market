export const updateQueryParams = ({ history, location, query, payload }) => {
  const params = query || new URLSearchParams();

  const mergeParam = (name, value) => {
    if (params.get(name)) {
      params.set(name, value);
    } else {
      params.append(name, value);
    }
  };

  console.log('QUERY :: update payload', payload);

  switch (payload.type) {
    case 'clear-modals':
      params.delete('product');
      break;

    case 'cart':
      params.delete('cart');
      if (payload.value) {
        mergeParam('cart', payload.value);
      }

      break;

    case 'product':
      mergeParam('product', payload.value);

      break;

    case 'category':
      params.delete('search');

      mergeParam('category', payload.value);

      break;

    case 'search':
      // params.delete('category');
      params.delete('size');
      params.delete('mark');
      params.delete('length');
      params.delete('product');

      if (params.get('category') === 'all') {
        params.delete('category');
      }

      mergeParam('search', payload.value);

      break;

    case 'filter':
      params.delete('search');
      params.delete('product');

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

  console.log('QUERY :: pushing params', params.toString());
  history.push({
    pathname: location.pathname,
    search: params.toString(),
  });
};
