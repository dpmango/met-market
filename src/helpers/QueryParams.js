export const updateQueryParams = ({ history, location, query, payload }) => {
  const params = query || new URLSearchParams();

  const mergeParam = (name, value) => {
    if (params.get(name)) {
      params.set(name, value);
    } else {
      params.append(name, value);
    }
  };

  switch (payload.type) {
    case 'category':
      params.delete('search');

      mergeParam('category', payload.value);

      break;

    case 'search':
      params.delete('category');
      params.delete('size');
      params.delete('mark');
      params.delete('length');

      mergeParam('search', payload.value);

      break;

    case 'filter':
      params.delete('search');

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

  history.push({
    pathname: location.pathname,
    search: params.toString(),
  });
};
