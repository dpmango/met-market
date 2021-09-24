import React, { memo, useState, useContext, useMemo, createContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';
import BounceLoader from 'react-spinners/BounceLoader';

import { SvgIcon } from '@ui';
import { AxiosInterceptors } from '@src/services';
import styles from './Loader.module.scss';

const LoaderContext = createContext();

const Loader = ({ className, ...props }) => {
  const [active, setActive] = useState(false);
  const { isLoading } = useContext(LoaderContext);

  useEffect(() => {
    const timer = setTimeout(() => setActive(isLoading), 300);

    return () => clearTimeout(timer);
  }, [isLoading, setActive]);

  return (
    <div className={cns(styles.loader, active && styles._active, className)}>
      <BounceLoader color="#3F51B5" loading={true} size={100} />
    </div>
  );
};

const LoaderContextProvider = (props) => {
  const [isLoading, setLoading] = useState(false);

  // const value = useMemo(
  //   () => ({
  //     isLoading,
  //     setLoading,
  //   }),
  //   [isLoading]
  // );

  return (
    <LoaderContext.Provider value={{ isLoading, setLoading }}>
      <AxiosInterceptors>{props.children}</AxiosInterceptors>
    </LoaderContext.Provider>
  );
};

Loader.propTypes = {
  className: PropTypes.string,
};

LoaderContextProvider.propTypes = {
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export { Loader, LoaderContext, LoaderContextProvider };
