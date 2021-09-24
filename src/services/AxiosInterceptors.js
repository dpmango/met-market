import { useContext, useMemo } from 'react';
import { api } from '@api';
import { LoaderContext } from '@ui';

const AxiosInterceptors = ({ children }) => {
  const { setLoading } = useContext(LoaderContext);

  useMemo(() => {
    api.interceptors.request.use(
      (x) => {
        setLoading(true);
        return x;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    api.interceptors.response.use(
      (x) => {
        setLoading(false);
        return x;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );
  }, [setLoading]);

  return children;
};

export default AxiosInterceptors;
