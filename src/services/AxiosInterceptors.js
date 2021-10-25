import { useContext, useMemo } from 'react';
import { api } from '@api';
import { LoaderContext } from '@ui';

const AxiosInterceptors = ({ children }) => {
  const { setLoading } = useContext(LoaderContext);

  useMemo(() => {
    const shouldUseInterceptor = (url) => {
      const keys = ['log', 'file'];

      return keys.every((key) => !url.includes(key));
    };

    api.interceptors.request.use(
      (x) => {
        if (shouldUseInterceptor(x.url)) {
          setLoading(true);
        }

        return x;
      },
      (error) => {
        setLoading(false);
        return Promise.reject(error);
      }
    );

    api.interceptors.response.use(
      (x) => {
        if (shouldUseInterceptor(x.config.url)) {
          setLoading(false);
        }

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
